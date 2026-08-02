package xicko.modules.tsyncnative.helpers

import android.R
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.graphics.toColorInt

object NotificationHelper {
    private const val CHANNEL_ID = "basic_notify_channel_1"
    private const val CHANNEL_NAME = "General Notifications NativeScheduler"
    private const val CONTINUOUS_ID = 313

    fun show(
        context: Context,
        title: String,
        message: String,
        icon: Int?,
    ) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT,
            )

            manager.createNotificationChannel(channel)
        }

        val icon = icon ?: R.drawable.ic_menu_mylocation

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(icon)
            .setContentTitle(title)
            .setContentText(message)
            .setAutoCancel(true)
            .setColor("#007AFF".toColorInt())
            .setColorized(true)

        manager.notify(System.currentTimeMillis().toInt(), builder.build())
    }

    fun showLive(
        context: Context,
        title: String,
        message: String,
        icon: Int?,
    ) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT,
            )

            manager.createNotificationChannel(channel)
        }

        val icon = icon ?: R.drawable.sym_action_chat

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(icon)
            .setContentTitle(title)
            .setContentText(message)
            .setAutoCancel(true)
            .setOngoing(true)

        manager.notify(CONTINUOUS_ID, builder.build())
    }
}