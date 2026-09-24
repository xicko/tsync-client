package xicko.modules.tsyncnative.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import xicko.modules.tsyncnative.BatteryWorker
import xicko.modules.tsyncnative.ConnectionWorker
import xicko.modules.tsyncnative.extensions.connectTailscale
import xicko.modules.tsyncnative.extensions.disableOptimizationsRoot
import xicko.modules.tsyncnative.extensions.openApp
import xicko.modules.tsyncnative.extensions.openTailscale
import java.util.concurrent.TimeUnit
import kotlin.time.Duration.Companion.milliseconds

class BootCompletedReceiver: BroadcastReceiver() {
  override fun onReceive(ctx: Context?, intent: Intent?) {
    if (intent?.action == "android.intent.action.BOOT_COMPLETED") {
      Log.i("BootCompletedReceiver", "BootCompletedReceiver")
      if (ctx == null) return

      ctx.let {
        val pendingResult = goAsync()

        val workManager = WorkManager.getInstance(it)

        CoroutineScope(Dispatchers.Default).launch {
          try {
            it.disableOptimizationsRoot()
            it.disableOptimizationsRoot("com.tailscale.ipn")

            it.openTailscale()
            delay(2000.milliseconds)
            it.connectTailscale()
            delay(2000.milliseconds)
            it.openApp()
          } catch (e: Exception) {
            e.printStackTrace()
          } finally {
            pendingResult.finish()
          }
        }

        // ==================================================================
        // Connection Worker
        val connectionOneTimeReq = OneTimeWorkRequestBuilder<ConnectionWorker>().build()
        workManager.enqueue(connectionOneTimeReq)
        val connectionPeriodicReq = PeriodicWorkRequestBuilder<ConnectionWorker>(15, TimeUnit.MINUTES).build()
        workManager.enqueueUniquePeriodicWork("connection_worker_boot",
          ExistingPeriodicWorkPolicy.UPDATE,
          connectionPeriodicReq
        )

        // ==================================================================
        // Connection Worker
        val batteryOneTimeReq = OneTimeWorkRequestBuilder<BatteryWorker>().build()
        workManager.enqueue(batteryOneTimeReq)
        val batteryPeriodicReq = PeriodicWorkRequestBuilder<BatteryWorker>(15, TimeUnit.MINUTES).build()
        workManager.enqueueUniquePeriodicWork("battery_worker_boot",
          ExistingPeriodicWorkPolicy.UPDATE,
          batteryPeriodicReq
        )
      }
    }
  }
}
