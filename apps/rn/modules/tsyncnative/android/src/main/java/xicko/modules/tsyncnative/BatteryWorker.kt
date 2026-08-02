package xicko.modules.tsyncnative

import androidx.work.CoroutineWorker
import android.content.Context
import android.util.Log
import androidx.work.WorkerParameters
import com.tencent.mmkv.MMKV
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.patch
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import xicko.modules.tsyncnative.data.TailscaleDevice
import xicko.modules.tsyncnative.helpers.JsonProvider
import xicko.modules.tsyncnative.helpers.retrieveBatteryStatus

class BatteryWorker(
  context: Context,
  params: WorkerParameters
): CoroutineWorker(context, params) {
  override suspend fun doWork(): Result {
    val client = HttpClient(CIO) {
      install(HttpTimeout) {
        connectTimeoutMillis = 5000L
        requestTimeoutMillis = 5000L
      }
      install(ContentNegotiation) {
        json(Json {
          ignoreUnknownKeys = true
          isLenient = true
          explicitNulls = false
        })
      }
    }

    MMKV.initialize(this.applicationContext)
    val mmkv = MMKV.mmkvWithID("root", MMKV.MULTI_PROCESS_MODE)
    val domain = mmkv.decodeString("domain", null) ?: throw Exception("domain not found")

    val thisTailscaleDeviceStr = mmkv.decodeString("thisTailscaleDevice", null) ?: throw Exception("thisTailscaleDevice not found")

    try {
      val thisTailscaleDevice = JsonProvider.json.decodeFromString<TailscaleDevice>(thisTailscaleDeviceStr)

      val batteryStatus = retrieveBatteryStatus(this.applicationContext) ?: throw Exception("batteryStatus not found")

      val response = client.patch("$domain/api/devices/${thisTailscaleDevice.id}/update-battery-status") {
        contentType(ContentType.Application.Json)
        setBody(batteryStatus)
      }

      Log.i("BatteryWorker", "update-battery-status response: ${response.bodyAsText()}")

      Result.success()
    } catch (e: Exception) {
      Log.i("BatteryWorker", "error: ${e.message}")
      Result.retry()
    } finally {
      client.close()
    }

    return Result.success()
  }
}