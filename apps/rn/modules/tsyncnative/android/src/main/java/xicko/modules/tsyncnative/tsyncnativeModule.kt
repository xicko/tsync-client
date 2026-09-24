package xicko.modules.tsyncnative

import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.tencent.mmkv.MMKV
import com.topjohnwu.superuser.Shell
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import xicko.modules.tsyncnative.extensions.*
import java.util.concurrent.TimeUnit

class tsyncnativeModule : Module() {
  private companion object {
    var isShellInit = false
  }

  override fun definition() = ModuleDefinition {
    Name("tsyncnative")

    OnCreate {
      if (!isShellInit) {
        try {
          if (Shell.getCachedShell() == null) {
            Shell.enableVerboseLogging = BuildConfig.DEBUG
            Shell.setDefaultBuilder(
              Shell.Builder.create()
                .setFlags(Shell.FLAG_MOUNT_MASTER)
                .setInitializers(Shell.Initializer::class.java)
                .setTimeout(10)
            )
          }
        } catch (e: Exception) {
          Log.w("tsyncnative", "Shell builder: ${e.message}")
        }
        isShellInit = true
      }

      appContext.reactContext?.let { MMKV.initialize(it) }
    }

    AsyncFunction("reloadApp") {
      val ctx = appContext.reactContext

      val pm = ctx?.packageManager
      val launchIntent = pm?.getLaunchIntentForPackage(ctx.packageName)
      val comp = launchIntent?.component
      val mainIntent = Intent.makeRestartActivityTask(comp)
      mainIntent.setPackage(ctx?.packageName);

      ctx?.startActivity(mainIntent)

      Runtime.getRuntime().exit(0);
    }

    Function("retrieveApps") {
      appContext.reactContext?.retrieveApps() ?: ""
    }

    Function("isIgnoringBatteryOptimizations") {
      appContext.reactContext?.isIgnoringBatteryOptimizations() ?: false
    }

    Function("disableBatteryOptimizations") { packageName: String? ->
      appContext.reactContext?.disableBatteryOptimizations(packageName)
    }

    Function("disableOptimizationsRoot") { packageName: String? ->
      appContext.reactContext?.disableOptimizationsRoot(packageName) ?: false
    }

    AsyncFunction("retrieveBatteryStatus") Coroutine { ->
      val result = appContext.reactContext?.retrieveBatteryStatus() ?: return@Coroutine null
      "${result.level}:${result.isPlugged}:${result.timestamp}"
    }

    Function("startConnectionWorker") {
      val ctx = appContext.reactContext

      // ==================================================================
      // Connection Worker
      val connectionPeriodicRequest = PeriodicWorkRequestBuilder<ConnectionWorker>(
        15,
        TimeUnit.MINUTES,
      ).setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build()
      if (ctx != null) WorkManager.getInstance(ctx).enqueueUniquePeriodicWork(
        "connection_worker",
        ExistingPeriodicWorkPolicy.UPDATE,
        connectionPeriodicRequest,
      )
      val connectionOneTimeRequest = OneTimeWorkRequestBuilder<ConnectionWorker>().build()
      if (ctx != null) WorkManager.getInstance(ctx).enqueue(connectionOneTimeRequest)
    }

    Function("startBatteryWorker") {
      val ctx = appContext.reactContext

      // ==================================================================
      // Battery Sync Worker
      val batteryPeriodicRequest = PeriodicWorkRequestBuilder<BatteryWorker>(
        15,
        TimeUnit.MINUTES,
      ).setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build()
      if (ctx != null) WorkManager.getInstance(ctx).enqueueUniquePeriodicWork(
        "battery_worker",
        ExistingPeriodicWorkPolicy.UPDATE,
        batteryPeriodicRequest,
      )
      val batteryOneTimeRequest = OneTimeWorkRequestBuilder<BatteryWorker>().build()
      if (ctx != null) WorkManager.getInstance(ctx).enqueue(batteryOneTimeRequest)
    }

    Function("isNotificationListenerEnabled") {
      appContext.reactContext?.isNotificationListenerEnabled() ?: false
    }

    Function("startNotificationListenerService") {
      appContext.reactContext?.startNotificationListenerService()
    }

    Function("blockNotificationsRoot") { packageName: String? ->
      appContext.reactContext?.blockNotificationsRoot(packageName) ?: false
    }

    Function("openTS") {
      appContext.reactContext?.openTailscale()
    }

    Function("connectTS") {
      appContext.reactContext?.connectTailscale()
    }

    Function("disconnectTS") {
      appContext.reactContext?.disconnectTailscale()
    }

    Function("getWirelessAdbPort") {
      getWirelessAdbPort()
    }

    Function("setWirelessAdbPort") { port: Int ->
      setWirelessAdbPort(port)
    }

    Function("reloadWirelessAdbPort") {
      reloadWirelessAdbPort()
    }

    Function("isRooted") {
      isRooted()
    }

    Function("rebootDevice") {
      rebootDevice()
    }

    Function("zipFileContent") { filePath: String ->
      zipFileContent(filePath)
    }

    Function("isZipMagiskModule") { filePath: String ->
      isZipMagiskModule(filePath)
    }

    Function("installMagiskModuleViaPath") { filePath: String ->
      installMagiskModuleViaPath(filePath)
    }
  }
}
