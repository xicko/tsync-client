package xicko.modules.tsyncnative.extensions

import android.content.Context
import android.content.Intent
import com.topjohnwu.superuser.Shell

fun Context.openTailscale() {
    val packageName = "com.tailscale.ipn"
    val intent = packageManager.getLaunchIntentForPackage(packageName)
    intent?.apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
    }
    intent?.let { startActivity(it) }
}

fun Context.connectTailscale() {
    val intent = Intent("com.tailscale.ipn.CONNECT_VPN")
        .setPackage("com.tailscale.ipn")
    sendBroadcast(intent)
}

fun Context.disconnectTailscale() {
    val intent = Intent("com.tailscale.ipn.DISCONNECT_VPN")
        .setPackage("com.tailscale.ipn")
    sendBroadcast(intent)
}

fun openTailscaleRoot() {
    val task = Shell.cmd("su -c am start -n com.tailscale.ipn/.MainActivity")
    task.enqueue()
}

fun connectTailscaleRoot() {
    val task = Shell.cmd("""
        su -c am start -n com.tailscale.ipn/.MainActivity

        sleep 3

        su -c am broadcast -a com.tailscale.ipn.CONNECT_VPN -n com.tailscale.ipn/.MainActivity

        sleep 2

        su -c am start -n com.xicko.tsync/.MainActivity
    """.trimIndent())
    task.enqueue()
}
