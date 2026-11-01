package xicko.modules.tsyncnative.extensions

import android.content.Context
import android.util.Log
import com.topjohnwu.superuser.Shell

fun getShell(): Shell {
  return Shell.getCachedShell() ?: Shell.getShell()
}

fun isRooted(): Boolean {
  val shell = getShell()
  Log.i("isRoot shell", "${shell.isRoot}")
  return shell.isRoot && Shell.isAppGrantedRoot() == true
}

val Context.isRooted: Boolean
  get() = xicko.modules.tsyncnative.extensions.isRooted()

fun installMagiskModuleViaPath(filePath: String): String? {
  val result = Shell.cmd("""
    magisk --install-module $filePath
  """.trimIndent()).exec()

  if (result.isSuccess) {
    if (result.out.firstOrNull() == null) return null

    return result.out.joinToString("\n")
  } else {
    if (result.err.firstOrNull() == null) return null

    return result.err.joinToString("\n")
  }
}

fun rebootDevice() {
  Shell.cmd("""
    reboot
  """.trimIndent()).exec()
}

fun getWirelessAdbPort(): Int? {
  val result = Shell.cmd("""
    cat /data/adb/wireless_adb.conf
  """.trimIndent()).exec()

  if (result.isSuccess) {
    val content = result.out.joinToString("\n")

    val portMatch = Regex("""^port\s*=\s*(\d+)""", RegexOption.MULTILINE).find(content)
    if (portMatch != null) return portMatch.groupValues[1].toIntOrNull()

    return Regex("""\b\d{4,5}\b""").find(content)?.value?.toIntOrNull()
  } else {
    Log.d("getWirelessAdbPort", "Error: ${result.err.firstOrNull()}")
    return null
  }
}

fun setWirelessAdbPort(port: Int): Boolean {
  if (port !in 1..65535) {
    Log.d("setWirelessAdbPort", "Invalid port")
    return false
  }

  val readResult = Shell.cmd("""
    cat /data/adb/wireless_adb.conf
  """.trimIndent()).exec()

  val lines = if (readResult.isSuccess) readResult.out.toMutableList() else mutableListOf()

  var portFound = false

  val updatedLines = lines.mapNotNull { line ->
    val trimmed = line.trim()
    when {
      trimmed.startsWith("port=") -> {
        portFound = true
        "port=$port"
      }
      trimmed.all { it.isDigit() } && trimmed.isNotEmpty() -> null
      else -> line
    }
  }.toMutableList()

  if (!portFound) updatedLines.add("port=$port")

  val content = updatedLines.joinToString("\n")
  val writeResult = Shell.cmd("""
    printf '%s\n' '$content' > /data/adb/wireless_adb.conf
  """.trimIndent()).exec()

  val updatedPort = getWirelessAdbPort()

  return writeResult.isSuccess && updatedPort == port
}

fun reloadWirelessAdbPort(): String? {
  val result = Shell.cmd("""
    sh /data/adb/modules/wireless-adb/action.sh
  """.trimIndent()).exec()

  if (result.isSuccess) {
    return result.out.firstOrNull() ?: "success"
  } else {
    Log.d("reloadWirelessAdbPort", "Error: ${result.err.firstOrNull()}")
    return null
  }
}

fun zipFileContent(filePath: String): List<String>? {
  val result = Shell.cmd("""
    unzip -l $filePath | awk 'NR > 3 && /^ *[0-9]+/ { for (i=4; i<=NF; i++) printf "%s%s", ${'$'}i, (i<NF ? " " : "\n") }'
  """.trimIndent()).exec()

  if (result.isSuccess) {
    val stringRes = result.out.joinToString("\n")
    return stringRes.split("\n")
  }

  return null
}

fun isZipMagiskModule(filePath: String): Boolean {
  if (!filePath.endsWith(".zip", ignoreCase = true)) return false

  val zipContent = zipFileContent(filePath) ?: return false

  val str = zipContent.joinToString("\n")

  val result = Shell.cmd("""
    unzip -pq $filePath "module.prop" | grep "^version="
  """.trimIndent()).exec()

  var containsVersion = false
  if (result.isSuccess) containsVersion = result.out.firstOrNull()?.contains("version=") ?: false

  val hasRelatedFiles = str.contains("service.sh") ||
    str.contains("module.prop") ||
    str.contains("action.sh")

  return hasRelatedFiles && containsVersion
}
