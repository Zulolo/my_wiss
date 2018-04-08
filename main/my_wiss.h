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

#include "esp_log.h"

#include "os.h"

#define WIFI_EVENT_GROUP_CONNECTED_BIT			BIT0
#define WIFI_EVENT_GROUP_ESPTOUCH_DONE_BIT		BIT1
#define WIFI_EVENT_GROUP_DISCONNECTED_BIT		BIT2

extern EventGroupHandle_t wifi_event_group;

#endif /* MAIN_MY_WISS_H_ */
