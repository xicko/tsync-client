package xicko.modules.tsyncnative.extensions

import android.content.Context
import android.content.Intent
import com.topjohnwu.superuser.Shell

fun Context.openTailscale() {
  val hasRootAccess = isRooted()
  if (hasRootAccess) {
    val result = Shell.cmd("am start -n com.tailscale.ipn/.MainActivity").exec()
    if (result.isSuccess) return
  }

  val intent = packageManager.getLaunchIntentForPackage("com.tailscale.ipn")
  intent?.apply {
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
    addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
  }
  intent?.let { startActivity(it) }
}

fun Context.connectTailscale() {
  val hasRootAccess = isRooted()

  if (hasRootAccess) {
    Shell.cmd("""
      am broadcast -a com.tailscale.ipn.CONNECT_VPN -n com.tailscale.ipn/.MainActivity
    """.trimIndent()).exec()
  }

  val intent = Intent("com.tailscale.ipn.CONNECT_VPN")
    .setPackage("com.tailscale.ipn")
  sendBroadcast(intent)
}

fun Context.disconnectTailscale() {
  val hasRootAccess = isRooted()

  if (hasRootAccess) {
    Shell.cmd("""
      am broadcast -a com.tailscale.ipn.DISCONNECT_VPN -n com.tailscale.ipn/.MainActivity
    """.trimIndent()).exec()
  }

  val intent = Intent("com.tailscale.ipn.DISCONNECT_VPN")
    .setPackage("com.tailscale.ipn")
  sendBroadcast(intent)
}
