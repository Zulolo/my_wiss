/*
 * mqtt_task.c
 *
 *  Created on: Apr 5, 2018
 *      Author: zulolo
 */

#include "lwip/err.h"
#include "lwip/sockets.h"
#include "lwip/sys.h"
#include "lwip/netdb.h"
#include "lwip/dns.h"
#include "lwip/apps/mqtt.h"

#include "cJSON.h"
#include "my_wiss.h"

static mqtt_client_t static_client;
void example_do_connect(mqtt_client_t *client);

static const char *TAG_MQTT = "mqtt_task";

static void mqtt_sub_request_cb(void *arg, err_t result) {
	/* Just print the result code here for simplicity,
	 normal behaviour would be to take some action if subscribe fails like
	 notifying user, retry subscribe or disconnect from server */
	printf("Subscribe result: %d\n", result);
}

static int inpub_id;
static void mqtt_incoming_publish_cb(void *arg, const char *topic, u32_t tot_len) {
	printf("Incoming publish at topic %s with total length %u\n", topic, (unsigned int) tot_len);

	/* Decode topic string into a user defined reference */
	if (strcmp(topic, "print_payload") == 0) {
		inpub_id = 0;
	} else if (topic[0] == 'A') {
		/* All topics starting with 'A' might be handled at the same way */
		inpub_id = 1;
	} else {
		/* For all other topics */
		inpub_id = 2;
	}
}

static void mqtt_incoming_data_cb(void *arg, const u8_t *data, u16_t len, u8_t flags) {
	printf("Incoming publish payload with length %d, flags %u\n", len, (unsigned int) flags);

	if (flags & MQTT_DATA_FLAG_LAST) {
		/* Last fragment of payload received (or whole part if payload fits receive buffer
		 See MQTT_VAR_HEADER_BUFFER_LEN)  */

		/* Call function or do action depending on reference, in this case inpub_id */
		if (inpub_id == 0) {
			/* Don't trust the publisher, check zero termination */
			if (data[len - 1] == 0) {
				printf("mqtt_incoming_data_cb: %s\n", (const char *) data);
			}
		} else if (inpub_id == 1) {
			/* Call an 'A' function... */
		} else {
			printf("mqtt_incoming_data_cb: Ignoring payload...\n");
		}
	} else {
		/* Handle fragmented payload, store in buffer, write to file or whatever */
	}
}

/* Called when publish is complete either with sucess or failure */
static void mqtt_pub_request_cb(void *arg, err_t result) {
	if (result != ERR_OK) {
		printf("Publish result: %d\n", result);
	}
}

void example_publish(mqtt_client_t *client, void *arg) {
	static char pub_payload[128];
	err_t err;
	u8_t qos = 0; /* 0 1 or 2, see MQTT specification */
	u8_t retain = 0; /* No don't retain such crappy payload... */
	sprintf(pub_payload, "{\"datastreams\":[{\"id\":\"mqtt_temp\",\"datapoints\":[{\"value\":%u}]}]}", (uint8_t)(os_random()%50));
	err = mqtt_publish(client, "$dp", pub_payload, strlen(pub_payload), qos, retain,
			mqtt_pub_request_cb, arg);
	if (err != ERR_OK) {
		printf("Publish err: %d\n", err);
	}
}

static void mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status) {
	err_t err;
	if (status == MQTT_CONNECT_ACCEPTED) {
		printf("mqtt_connection_cb: Successfully connected\n");

		/* Setup callback for incoming publish requests */
		mqtt_set_inpub_callback(client, mqtt_incoming_publish_cb, mqtt_incoming_data_cb, arg);

		/* Subscribe to a topic named "subtopic" with QoS level 1, call mqtt_sub_request_cb with result */
		err = mqtt_subscribe(client, "subtopic", 1, mqtt_sub_request_cb, arg);

		if (err != ERR_OK) {
			printf("mqtt_subscribe return: %d\n", err);
		}
	} else {
		printf("mqtt_connection_cb: Disconnected, reason: %d\n", status);

		/* Its more nice to be connected, so try to reconnect */
		vTaskDelay(5000 / portTICK_PERIOD_MS);
		example_do_connect(client);
	}
}

void example_do_connect(mqtt_client_t *client)
{
  struct mqtt_connect_client_info_t ci;
  ip_addr_t broker_ip;
  err_t err;

  /* Setup an empty client info structure */
  memset(&ci, 0, sizeof(ci));

  /* Minimal amount of information required is client identifier, so set it here */
  ci.client_id = "26994614";
  ci.client_user = "125058";
  ci.client_pass = "da39a3ee5e6b4b0d3255bfef95601890afd80709";
  ci.keep_alive = 600;

  /* Initiate client and connect to server, if this fails immediately an error code is returned
     otherwise mqtt_connection_cb will be called with connection result after attempting
     to establish a connection with the server.
     For now MQTT version 3.1.1 is always used */
//  ip4addr_aton("183.230.40.39",(ip4_addr_t*)(&broker_ip));
  IP_ADDR4(&broker_ip, 183, 230, 40, 39);
  err = mqtt_client_connect(client, &broker_ip, 6002, mqtt_connection_cb, 0, &ci);

  /* For now just print the result code if something goes wrong*/
  if(err != ERR_OK) {
    printf("mqtt_connect return %d\n", err);
  }
}

void mqtt_task(void *pvParameters)
{
	ESP_LOGI(TAG_MQTT, "start mqtt task.");
	xEventGroupWaitBits(wifi_event_group, WIFI_EVENT_GROUP_CONNECTED_BIT, false, true, portMAX_DELAY);
	example_do_connect(&static_client);
	while (1) {
		xEventGroupWaitBits(wifi_event_group, WIFI_EVENT_GROUP_CONNECTED_BIT, false, true, portMAX_DELAY);
		if (mqtt_client_is_connected(&static_client)) {
			example_publish(&static_client, "example publish");
		}
		vTaskDelay(5000 / portTICK_PERIOD_MS);
	}

}
