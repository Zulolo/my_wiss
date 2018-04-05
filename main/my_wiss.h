/*
 * my_wiss.h
 *
 *  Created on: Apr 5, 2018
 *      Author: zulolo
 */

#ifndef MAIN_MY_WISS_H_
#define MAIN_MY_WISS_H_

#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event_loop.h"
#include "esp_log.h"
#include "nvs_flash.h"

#include "lwip/err.h"
#include "lwip/sockets.h"
#include "lwip/sys.h"
#include "lwip/netdb.h"
#include "lwip/dns.h"
#include "lwip/apps/mqtt.h"

#include "cJSON.h"

#include "os.h"

#define WIFI_EVENT_GROUP_CONNECTED_BIT			BIT0

extern EventGroupHandle_t wifi_event_group;

#endif /* MAIN_MY_WISS_H_ */
