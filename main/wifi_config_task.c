/*
 * wifi_config_task.c
 *
 *  Created on: Apr 5, 2018
 *      Author: zulolo
 */

#include "esp_wifi.h"
#include "esp_event_loop.h"
#include "nvs_flash.h"

#include "my_wiss.h"


#define EXAMPLE_WIFI_SSID "zulolo"
#define EXAMPLE_WIFI_PASS "leon0873"

/* FreeRTOS event group to signal when we are connected & ready to make a request */
EventGroupHandle_t wifi_event_group;

static const char *TAG_MAIN = "main";


static esp_err_t event_handler(void *ctx, system_event_t *event)
{
    switch(event->event_id) {
    case SYSTEM_EVENT_STA_START:
        esp_wifi_connect();
        break;
    case SYSTEM_EVENT_STA_GOT_IP:
        xEventGroupSetBits(wifi_event_group, WIFI_EVENT_GROUP_CONNECTED_BIT);
        break;
    case SYSTEM_EVENT_STA_DISCONNECTED:
        /* This is a workaround as ESP32 WiFi libs don't currently
           auto-reassociate. */
        esp_wifi_connect();
        xEventGroupClearBits(wifi_event_group, WIFI_EVENT_GROUP_CONNECTED_BIT);
        break;
    default:
        break;
    }
    return ESP_OK;
}
static esp_err_t get_ssid_from_nvs(u8_t *ssid, u8_t ssid_len, u8_t *password, u8_t password_len)
{
	ESP_ERROR_CHECK( nvs_flash_init() );
	return ESP_OK;
}

void wifi_connect(void)
{
	wifi_config_t wifi_config;

    ESP_ERROR_CHECK( esp_wifi_stop() );
    // check if there is configured SSID and password
    if (ESP_OK == get_ssid_from_nvs(wifi_config.sta.ssid, sizeof(wifi_config.sta.ssid),
    		wifi_config.sta.password, sizeof(wifi_config.sta.password))) {
        ESP_LOGI(TAG_MAIN, "Setting WiFi configuration SSID %s...", wifi_config.sta.ssid);
        ESP_ERROR_CHECK( esp_wifi_set_mode(WIFI_MODE_STA) );
        ESP_ERROR_CHECK( esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config) );
        ESP_ERROR_CHECK( esp_wifi_start() );
    } else {
    	// start smart_config
    }

}

void initialise_wifi(void)
{
    tcpip_adapter_init();
    wifi_event_group = xEventGroupCreate();
    ESP_ERROR_CHECK( esp_event_loop_init(event_handler, NULL) );
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK( esp_wifi_init(&cfg) );
    ESP_ERROR_CHECK( esp_wifi_set_storage(WIFI_STORAGE_RAM) );
    wifi_connect();
}
