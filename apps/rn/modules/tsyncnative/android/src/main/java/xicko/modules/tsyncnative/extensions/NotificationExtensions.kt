package xicko.modules.tsyncnative.extensions

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationCompat
import androidx.core.graphics.toColorInt
import com.topjohnwu.superuser.Shell
import xicko.modules.tsyncnative.services.NotificationListenerServiceImpl

private const val CHANNEL_ID = "basic_notify_channel_1"
private const val CHANNEL_NAME = "General Notifications NativeScheduler"
private const val CONTINUOUS_ID = 313

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

    val cmd = Shell.cmd("""
        su -c appops set $pn POST_NOTIFICATION ignore
    """.trimIndent())

    cmd.enqueue()

    return true
}
