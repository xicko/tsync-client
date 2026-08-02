package xicko.modules.tsyncnative.helpers

import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.BatteryManager
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import androidx.core.net.toUri
import com.topjohnwu.superuser.Shell
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import xicko.modules.tsyncnative.data.AppInfo
import xicko.modules.tsyncnative.data.BatteryStatus
import xicko.modules.tsyncnative.services.NotificationListenerServiceImpl

fun isIgnoringBatteryOptimizations(context: Context): Boolean {
    val pm = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
    return pm?.isIgnoringBatteryOptimizations(context.packageName) == true
}

fun disableBatteryOptimizations(context: Context, packageName: String? = null) {
    val pn = packageName ?: context.packageName
    val data = "package:$pn".toUri()
    val intent = Intent().setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK).setData(data)

    context.startActivity(intent)
}

fun openTS(context: Context): Unit {
    val packageName = "com.tailscale.ipn"
    val packageManager = context.packageManager

    val intent = packageManager.getLaunchIntentForPackage(packageName)
    intent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

    intent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    intent?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
    intent?.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    intent?.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)

    context.startActivity(intent)
}

fun connectTS(context: Context): Unit {
    val packageName = "com.tailscale.ipn"
    val actionName = "com.tailscale.ipn.CONNECT_VPN"

    val intent = Intent(actionName)
        .setPackage(packageName)

    context.sendBroadcast(intent)
}

fun disconnectTS(context: Context): Unit {
    val packageName = "com.tailscale.ipn"
    val actionName = "com.tailscale.ipn.DISCONNECT_VPN"

    val intent = Intent(actionName)
        .setPackage(packageName)

    context.sendBroadcast(intent)
}

fun getShell(): Shell {
    return Shell.getCachedShell() ?: Shell.getShell()
}

fun isRooted(): Boolean {
    val shell = getShell()

    Log.i("isRoot shell", "${shell.isRoot}")

    return shell.isRoot && Shell.isAppGrantedRoot() == true
}

fun openTSRoot() {
    val task = Shell.cmd("su -c am start -n com.tailscale.ipn/.MainActivity")

    task.enqueue()
}

fun connectTSRoot() {
    val task = Shell.cmd("""
        su -c am start -n com.tailscale.ipn/.MainActivity

        sleep 3

        su -c am broadcast -a com.tailscale.ipn.CONNECT_VPN -n com.tailscale.ipn/.MainActivity

        sleep 2

        su -c am start -n com.xicko.tsync/.MainActivity
    """.trimIndent())

    task.enqueue()
}

fun disableOptimizationsRoot(context: Context, packageName: String?): Boolean {
    val pn = packageName ?: context.packageName

    if (pn == "") return false

    val cmd = Shell.cmd("""
        su -c dumpsys deviceidle whitelist +$pn

        su -c cmd appops set $pn RUN_ANY_IN_BACKGROUND allow

        su -c cmd appops set $pn RUN_IN_BACKGROUND allow

        su -c am set-standby-bucket $pn active
    """.trimIndent())

    cmd.enqueue()

    return true
}

fun blockNotificationsRoot(context: Context, packageName: String?): Boolean {
    val pn = packageName ?: context.packageName

    if (pn == "") return false

    val cmd = Shell.cmd("""
        su -c appops set $pn POST_NOTIFICATION ignore
    """.trimIndent())

    cmd.enqueue()

    return true
}

suspend fun retrieveBatteryStatus(ctx: Context?): BatteryStatus? = withContext(Dispatchers.IO) {
    // try direct root method first
    val levelQueue = Shell.cmd("""
        su -c cmd battery get level
    """.trimIndent())
    val queue1 = levelQueue.exec()
    var level: Int? = queue1.out.firstOrNull()?.trim()?.toInt()

    val pluggedQueue = Shell.cmd("""
        su -c dumpsys battery | grep "status:"
    """.trimIndent())
    val queue2 = pluggedQueue.exec()
    val plugged = queue2.out.firstOrNull()?.trim() ?: ""
    val pluggedBool = plugged
        .substringAfter(":", "")
        .trim()
        .toIntOrNull() == 2

    var timestamp = System.currentTimeMillis()

    Log.d("BatteryStatus (root)", "$level $pluggedBool $timestamp")

    // try BatteryManager method as fallback
    if (level == null || plugged == "") {
        if (ctx == null) return@withContext null

        val batteryManager = ctx.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager

        val isCharging = batteryManager?.isCharging
        level = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        timestamp = System.currentTimeMillis()

        if (level != null && isCharging != null) {
            Log.d("BatteryStatus (non-root)", "$level $pluggedBool $timestamp")
            return@withContext BatteryStatus(
                level = level,
                isPlugged = isCharging,
                timestamp = timestamp
            )
        }

      return@withContext null
    }

    return@withContext BatteryStatus(level.toInt(), pluggedBool, timestamp)
}

fun isNotificationListenerEnabled(ctx: Context?): Boolean {
    if (ctx == null) return false

    val enabled = Settings.Secure.getString(
        ctx.contentResolver,
        "enabled_notification_listeners"
    ) ?: return false

    val component = ComponentName(
        ctx,
        NotificationListenerServiceImpl::class.java
    ).flattenToString()

    return enabled.contains(component)
}

fun startNotificationListenerService(ctx: Context?) {
    if (isNotificationListenerEnabled(ctx)) return

    val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

    ctx?.startActivity(intent)
}

fun retrieveApps(ctx: Context?): String {
  val appList = mutableListOf<AppInfo>()
  try {
    val packageManager = ctx?.packageManager

    val flags = PackageManager.GET_META_DATA
    val installedApps = packageManager?.getInstalledApplications(flags)

    if (installedApps != null) {
      for (appInfo in installedApps) {
        appList.add(
          AppInfo(
            appInfo.loadLabel(packageManager).toString(),
            appInfo.packageName,
          )
        )
      }
    }

    return Json.encodeToString(appList)
  } catch (e: Exception) {
    e.message?.let { Log.d("retrieveApps error:", it) }
    return ""
  }
}
