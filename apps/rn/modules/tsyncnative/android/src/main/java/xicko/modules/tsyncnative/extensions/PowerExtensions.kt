package xicko.modules.tsyncnative.extensions

import android.content.Context
import android.content.Intent
import android.os.BatteryManager
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import androidx.core.net.toUri
import com.topjohnwu.superuser.Shell
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import xicko.modules.tsyncnative.data.BatteryStatus

fun Context.isIgnoringBatteryOptimizations(): Boolean {
  val pm = getSystemService(Context.POWER_SERVICE) as? PowerManager
  return pm?.isIgnoringBatteryOptimizations(packageName) == true
}

fun Context.disableBatteryOptimizations(packageName: String? = null) {
  val pn = packageName ?: this.packageName
  val data = "package:$pn".toUri()
  val intent = Intent()
    .setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
    .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    .setData(data)

  startActivity(intent)
}

fun Context.disableOptimizationsRoot(packageName: String? = null): Boolean {
  val pn = packageName ?: this.packageName

  if (pn.isEmpty()) return false

  val result = Shell.cmd("""
    dumpsys deviceidle whitelist +$pn

    cmd appops set $pn RUN_ANY_IN_BACKGROUND allow

    cmd appops set $pn RUN_IN_BACKGROUND allow

    am set-standby-bucket $pn active
  """.trimIndent()).exec()

  return result.isSuccess
}

suspend fun Context.retrieveBatteryStatus(): BatteryStatus? = withContext(Dispatchers.IO) {
  // try direct root method first
  val levelQueue = Shell.cmd("""
    cmd battery get level
  """.trimIndent())
  val queue1 = levelQueue.exec()
  val level: Int? = queue1.out.firstOrNull()?.trim()?.toIntOrNull()

  val pluggedQueue = Shell.cmd("""
    dumpsys battery | grep "status:"
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
  if (level == null || plugged.isEmpty()) {
    val batteryManager = getSystemService(Context.BATTERY_SERVICE) as? BatteryManager

    val isCharging = batteryManager?.isCharging
    val fallbackLevel = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    timestamp = System.currentTimeMillis()

    if (fallbackLevel != null && isCharging != null) {
      Log.d("BatteryStatus (non-root)", "$fallbackLevel $pluggedBool $timestamp")
      return@withContext BatteryStatus(
        level = fallbackLevel,
        isPlugged = isCharging,
        timestamp = timestamp
      )
    }

    return@withContext null
  }

  return@withContext BatteryStatus(level, pluggedBool, timestamp)
}
