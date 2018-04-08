/*
 * wifi_config_task.c
 *
 *  Created on: Apr 5, 2018
 *      Author: zulolo
 */

#include "esp_wifi.h"
#include "esp_event_loop.h"
#include "nvs_flash.h"
#include "esp_smartconfig.h"

#include "my_wiss.h"


typedef enum {
    WIFI_CONNECT_NORMAL,
	WIFI_CONNECT_SMARTCONFIG
} wifi_connect_type_t;

/* FreeRTOS event group to signal when we are connected & ready to make a request */
EventGroupHandle_t wifi_event_group;

static const char *TAG_WIFI = "wifi";
static wifi_connect_type_t how_to_connect_wifi;
static wifi_config_t wifi_config;

static esp_err_t set_ssid_to_nvs(char *ssid, char *password);
static void smartconfig_task(void * parm);

static esp_err_t event_handler(void *ctx, system_event_t *event)
{
    switch(event->event_id) {
    case SYSTEM_EVENT_STA_START:
    	if (WIFI_CONNECT_NORMAL == how_to_connect_wifi) {
//    		ESP_LOGI(TAG_WIFI, "CONNECT");
    		esp_wifi_connect();
    	} else {
    		xTaskCreate(smartconfig_task, "smartconfig_task", 4096, NULL, 3, NULL);
    	}
        break;
    case SYSTEM_EVENT_STA_GOT_IP:
        xEventGroupSetBits(wifi_event_group, WIFI_EVENT_GROUP_CONNECTED_BIT);
        xEventGroupClearBits(wifi_event_group, WIFI_EVENT_GROUP_DISCONNECTED_BIT);
        break;
    case SYSTEM_EVENT_STA_DISCONNECTED:
        /* This is a workaround as ESP32 WiFi libs don't currently
           auto-reassociate. */
    	xEventGroupClearBits(wifi_event_group, WIFI_EVENT_GROUP_CONNECTED_BIT);
    	xEventGroupSetBits(wifi_event_group, WIFI_EVENT_GROUP_DISCONNECTED_BIT);
    	if (WIFI_CONNECT_NORMAL == how_to_connect_wifi) {
    		esp_wifi_connect();
    	} else {
    		xTaskCreate(smartconfig_task, "smartconfig_task", 4096, NULL, 3, NULL);
    	}
        break;
    default:
        break;
    }
    return ESP_OK;
}

static void sc_callback(smartconfig_status_t status, void *pdata)
{
    switch (status) {
        case SC_STATUS_WAIT:
            ESP_LOGI(TAG_WIFI, "SC_STATUS_WAIT");
            break;
        case SC_STATUS_FIND_CHANNEL:
            ESP_LOGI(TAG_WIFI, "SC_STATUS_FINDING_CHANNEL");
            break;
        case SC_STATUS_GETTING_SSID_PSWD:
            ESP_LOGI(TAG_WIFI, "SC_STATUS_GETTING_SSID_PSWD");
            break;
        case SC_STATUS_LINK:
            ESP_LOGI(TAG_WIFI, "SC_STATUS_LINK");
            wifi_config_t *wifi_config = pdata;
            ESP_LOGI(TAG_WIFI, "SSID:%s", wifi_config->sta.ssid);
            ESP_LOGI(TAG_WIFI, "PASSWORD:%s", wifi_config->sta.password);
            set_ssid_to_nvs((char *)(wifi_config->sta.ssid), (char *)(wifi_config->sta.password));
            how_to_connect_wifi = WIFI_CONNECT_NORMAL;
            ESP_ERROR_CHECK( esp_wifi_disconnect() );
            ESP_ERROR_CHECK( esp_wifi_set_config(ESP_IF_WIFI_STA, wifi_config) );
            ESP_ERROR_CHECK( esp_wifi_connect() );
            break;
        case SC_STATUS_LINK_OVER:
            ESP_LOGI(TAG_WIFI, "SC_STATUS_LINK_OVER");
            if (pdata != NULL) {
                uint8_t phone_ip[4] = { 0 };
                memcpy(phone_ip, (uint8_t* )pdata, 4);
                ESP_LOGI(TAG_WIFI, "Phone ip: %d.%d.%d.%d\n", phone_ip[0], phone_ip[1], phone_ip[2], phone_ip[3]);
            }
            xEventGroupSetBits(wifi_event_group, WIFI_EVENT_GROUP_ESPTOUCH_DONE_BIT);
            break;
        default:
            break;
    }
}

static void smartconfig_task(void * parm)
{
    EventBits_t uxBits;
    ESP_ERROR_CHECK( esp_smartconfig_set_type(SC_TYPE_ESPTOUCH_AIRKISS) );
    ESP_ERROR_CHECK( esp_smartconfig_start(sc_callback) );
    while (1) {
        uxBits = xEventGroupWaitBits(wifi_event_group, WIFI_EVENT_GROUP_CONNECTED_BIT | WIFI_EVENT_GROUP_ESPTOUCH_DONE_BIT,
        		true, false, portMAX_DELAY);
        if(uxBits & WIFI_EVENT_GROUP_CONNECTED_BIT) {
            ESP_LOGI(TAG_WIFI, "WiFi Connected to ap");
        }
        if(uxBits & WIFI_EVENT_GROUP_ESPTOUCH_DONE_BIT) {
            ESP_LOGI(TAG_WIFI, "smartconfig over");
            esp_smartconfig_stop();
            vTaskDelete(NULL);
        }
    }
}

static esp_err_t set_ssid_to_nvs(char *ssid, char *password)
{
	nvs_handle my_handle;
	esp_err_t err;

    err = nvs_open("wifi", NVS_READWRITE, &my_handle);
    if (err != ESP_OK) {
    	ESP_LOGE(TAG_WIFI, "nvs open with error %d.\n", err);
        return err;
    }

	if (ESP_OK != nvs_set_str(my_handle, "ssid", ssid)){
		nvs_close(my_handle);
		return ESP_ERR_NOT_FOUND;
	}
	if (ESP_OK != nvs_set_str(my_handle, "password", password)){
		nvs_close(my_handle);
		return ESP_ERR_NOT_FOUND;
	}
	// Close
	nvs_close(my_handle);

	return ESP_OK;
}

static esp_err_t get_ssid_from_nvs(char *ssid, size_t ssid_len, char *password, size_t password_len)
{
	nvs_handle my_handle;
	esp_err_t err;

    err = nvs_open("wifi", NVS_READONLY, &my_handle);
    if (err != ESP_OK) {
    	ESP_LOGE(TAG_WIFI, "nvs open with error %d.\n", err);
        return err;
    }

	if (ESP_OK != nvs_get_str(my_handle, "ssid", ssid, &ssid_len)){
		nvs_close(my_handle);
		return ESP_ERR_NOT_FOUND;
	}
	if (ESP_OK != nvs_get_str(my_handle, "password", password, &password_len)){
		nvs_close(my_handle);
		return ESP_ERR_NOT_FOUND;
	}
	// Close
	nvs_close(my_handle);

	ESP_LOGI(TAG_WIFI, "Read SSID:%s and password:%s from nvs, ", ssid, password);
	return ESP_OK;
}

void start_wifi_connect(wifi_config_t *wifi_config)
{
    ESP_ERROR_CHECK( esp_wifi_stop() );
    ESP_ERROR_CHECK( esp_wifi_set_mode(WIFI_MODE_STA) );
    ESP_LOGI(TAG_WIFI, "Setting WiFi configuration SSID %s...", wifi_config->sta.ssid);
    ESP_ERROR_CHECK( esp_wifi_set_config(ESP_IF_WIFI_STA, wifi_config) );
    how_to_connect_wifi = WIFI_CONNECT_NORMAL;
    ESP_ERROR_CHECK( esp_wifi_start() );
}

void start_smart_config(void)
{
    ESP_ERROR_CHECK( esp_wifi_stop() );
    ESP_ERROR_CHECK( esp_wifi_set_mode(WIFI_MODE_STA) );
    how_to_connect_wifi = WIFI_CONNECT_SMARTCONFIG;
    ESP_ERROR_CHECK( esp_wifi_start() );
}

static void config_wifi(void)
{
    // check if there is configured SSID and password
    if (ESP_OK == get_ssid_from_nvs((char *)(wifi_config.sta.ssid), sizeof(wifi_config.sta.ssid),
    		(char *)(wifi_config.sta.password), sizeof(wifi_config.sta.password))) {
    	start_wifi_connect(&wifi_config);
    } else {
    	// start smart_config
    	start_smart_config();
    }
}

void initialise_wifi(void)
{
    tcpip_adapter_init();
    wifi_event_group = xEventGroupCreate();
    xEventGroupClearBits(wifi_event_group, WIFI_EVENT_GROUP_CONNECTED_BIT);
    xEventGroupSetBits(wifi_event_group, WIFI_EVENT_GROUP_DISCONNECTED_BIT);
    ESP_ERROR_CHECK( esp_event_loop_init(event_handler, NULL) );
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK( esp_wifi_init(&cfg) );
    ESP_ERROR_CHECK( esp_wifi_set_storage(WIFI_STORAGE_RAM) );
    config_wifi();
}
