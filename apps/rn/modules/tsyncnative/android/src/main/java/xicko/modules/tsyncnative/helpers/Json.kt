package xicko.modules.tsyncnative.helpers

import kotlinx.serialization.json.Json

object JsonProvider {
  val json = Json {
    ignoreUnknownKeys = true
    isLenient = true
    explicitNulls = false
  }
}