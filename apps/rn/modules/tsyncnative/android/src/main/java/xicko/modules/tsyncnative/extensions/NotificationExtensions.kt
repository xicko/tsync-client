package xicko.modules.tsyncnative.extensions

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.graphics.toColorInt
import com.tencent.mmkv.MMKV
import com.topjohnwu.superuser.Shell
import xicko.modules.tsyncnative.data.WorkerType
import xicko.modules.tsyncnative.data.WorkersConfig
import xicko.modules.tsyncnative.services.NotificationListenerServiceImpl

private const val CHANNEL_ID = "basic_notify_channel_1"
private const val CHANNEL_NAME = "General Notifications NativeScheduler"
private const val CONTINUOUS_ID = 313

fun Context.getWorkersConfig(): WorkersConfig {
  return try {
    MMKV.initialize(this)
    val mmkv = MMKV.mmkvWithID("root", MMKV.MULTI_PROCESS_MODE)
    val jsonStr = mmkv.decodeString("workers_config", null)
    if (jsonStr != null) {
      JsonProvider.json.decodeFromString<WorkersConfig>(jsonStr)
    } else {
      WorkersConfig()
    }
  } catch (e: Exception) {
    Log.w("NotificationExtensions", "Failed to read workers_config: ${e.message}")
    WorkersConfig()
  }
}

fun Context.showWorkerNotification(
  worker: WorkerType,
  title: String,
  message: String,
  icon: Int? = null,
) {
  val config = getWorkersConfig()
  val shouldNotify = when (worker) {
    WorkerType.CONNECTION -> config.connection.showNotifications
    WorkerType.BATTERY -> config.battery.showNotifications
  }

  if (!shouldNotify) return

  showNotification(title, message, icon)
}

fun Context.showNotification(
  title: String,
  message: String,
  icon: Int? = null,
) {
  val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_DEFAULT,
    )
    manager.createNotificationChannel(channel)
  }

  val iconRes = icon ?: android.R.drawable.ic_menu_mylocation

  val builder = NotificationCompat.Builder(this, CHANNEL_ID)
    .setSmallIcon(iconRes)
    .setContentTitle(title)
    .setContentText(message)
    .setAutoCancel(true)
    .setColor("#007AFF".toColorInt())
    .setColorized(true)

  manager.notify(System.currentTimeMillis().toInt(), builder.build())
}

fun Context.showLiveNotification(
  title: String,
  message: String,
  icon: Int? = null,
) {
  val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_DEFAULT,
    )
    manager.createNotificationChannel(channel)
  }

  val iconRes = icon ?: android.R.drawable.sym_action_chat

  val builder = NotificationCompat.Builder(this, CHANNEL_ID)
    .setSmallIcon(iconRes)
    .setContentTitle(title)
    .setContentText(message)
    .setAutoCancel(true)
    .setOngoing(true)

  manager.notify(CONTINUOUS_ID, builder.build())
}

fun Context.isNotificationListenerEnabled(): Boolean {
  val enabled = Settings.Secure.getString(
    contentResolver,
    "enabled_notification_listeners"
  ) ?: return false

  val component = ComponentName(
    this,
    NotificationListenerServiceImpl::class.java
  ).flattenToString()

  return enabled.contains(component)
}

fun Context.startNotificationListenerService() {
  if (isNotificationListenerEnabled()) return

  val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS").apply {
    flags = Intent.FLAG_ACTIVITY_NEW_TASK
  }

  startActivity(intent)
}

fun Context.blockNotificationsRoot(packageName: String? = null): Boolean {
  val pn = packageName ?: this.packageName

  if (pn.isEmpty()) return false

  val result = Shell.cmd("""
    appops set $pn POST_NOTIFICATION ignore
  """.trimIndent()).exec()

  return result.isSuccess
}
