package xicko.modules.tsyncnative.services

import android.app.Notification
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.tencent.mmkv.MMKV
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.serialization.InternalSerializationApi
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import xicko.modules.tsyncnative.data.CollectedNotificationAndroid
import xicko.modules.tsyncnative.data.CollectedNotificationAndroidData
import xicko.modules.tsyncnative.data.CollectedNotificationAndroidDataList
import xicko.modules.tsyncnative.data.TailscaleDevice
import xicko.modules.tsyncnative.helpers.JsonProvider
import java.util.concurrent.Executors

fun isBlacklistedNotification(sbn: StatusBarNotification?): Boolean {
  if (sbn == null) {
    return true
  }

  if (sbn.packageName.startsWith("com.whatsapp") && sbn.key!!.contains("null")) {
    return true
  }

  if (sbn.packageName == "com.sec.android.app.clock.package") {
    return true
  }

  if (sbn.packageName.lowercase().contains("tsync")) {
    return true
  }

  if (sbn.key == "-1|android|27|null|1000") {
    return true
  }

  if (sbn.key == "charging_state") {
    return true
  }

  if (sbn.packageName == "com.android.systemui") return true

  return sbn.key == "com.sec.android.app.samsungapps|121314|null|10091"
}

class NotificationListenerServiceImpl : NotificationListenerService() {
  private val notiExecutor = Executors.newSingleThreadExecutor()
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

  @OptIn(InternalSerializationApi::class)
  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    super.onNotificationPosted(sbn)

    if (sbn == null) return

    if (isBlacklistedNotification(sbn)) return

    val systemNotificationTitles = arrayOf<String>(
      "Choose input method",
      "Secure Folder locked.",
      "LSPosed loaded",
      ""
    )

    MMKV.initialize(this.applicationContext)
    val mmkv = MMKV.mmkvWithID("root", MMKV.MULTI_PROCESS_MODE)

    notiExecutor.execute {
      val notificationExtras = sbn.notification.extras

      val title = notificationExtras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
      val conversationTitle = notificationExtras.getCharSequence(Notification.EXTRA_CONVERSATION_TITLE)?.toString().orEmpty()
      val text = notificationExtras.getCharSequence(Notification.EXTRA_TEXT)?.toString().orEmpty()
      val bigText = notificationExtras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString().orEmpty()
      val infoText = notificationExtras.getCharSequence(Notification.EXTRA_INFO_TEXT)?.toString().orEmpty()
      val titleBig = notificationExtras.getCharSequence(Notification.EXTRA_TITLE_BIG)?.toString().orEmpty()
      val peopleList: String = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        try {
          notificationExtras.getCharSequenceArrayList(Notification.EXTRA_PEOPLE_LIST)
            ?.toString().orEmpty()
        } catch (e: ClassCastException) {
          Log.i("NotificationListenerServiceImpl", "error casting: ${e.stackTraceToString()}")
          String()
        }
      } else {
        String()
      }

      if (systemNotificationTitles.contains(title)) return@execute

      val collectedNotif = CollectedNotificationAndroidData(
        sbn.packageName,
        sbn.postTime,
        title,
        text,
        bigText,
        infoText,
        titleBig,
        conversationTitle,
        peopleList
      )

      // Send to server
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
      try {
        val domain = mmkv.decodeString("domain", null) ?: throw Exception("domain not found")
        val thisTailscaleDeviceStr = mmkv.decodeString("thisTailscaleDevice", null) ?: throw Exception("thisTailscaleDevice not found")
        val thisTailscaleDevice = JsonProvider.json.decodeFromString<TailscaleDevice>(thisTailscaleDeviceStr)
        val body = CollectedNotificationAndroid(
          type = "android",
          android = collectedNotif
        )
        scope.launch {
          Log.i("NotificationListenerServiceImpl", "sending notification to server ${thisTailscaleDevice.id}")
          Log.i("NotificationListenerServiceImpl", "domain: ${"$domain/api/notifications-sync/devices/${thisTailscaleDevice.id}/receive-notification"}")
          try {
            val response = client.post("$domain/api/notifications-sync/devices/${thisTailscaleDevice.id}/receive-notification") {
              contentType(ContentType.Application.Json)
              setBody(body)
            }

            Log.i("NotificationListenerServiceImpl", "response: ${response.bodyAsText()} ${response.status}")
          } catch (e: Exception) {
            Log.i("NotificationListenerServiceImpl", "error: ${e.message}")
          } finally {
            client.close()
          }
        }
      } catch (e: Exception) {
        Log.i("NotificationListenerServiceImpl", "error: ${e.message}")
      }

      Log.i("NotificationListenerServiceImpl", "onNotificationPosted: $collectedNotif")
    }
  }

  override fun onDestroy() {
    notiExecutor.shutdown()

    super.onDestroy()
  }
}