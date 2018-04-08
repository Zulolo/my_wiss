/*
 * webserver.c
 *
 *  Created on: Apr 7, 2018
 *      Author: zulolo
 */

#include "cJSON.h"
#include <libesphttpd/esp.h>
#include "libesphttpd/httpd.h"
#include "libesphttpd/httpdespfs.h"
#include "libesphttpd/espfs.h"
#include "libesphttpd/webpages-espfs.h"
#include "libesphttpd/route.h"
#include "my_wiss.h"

static const char *TAG_WEBSERVER = "webserver_task";
CgiStatus ICACHE_FLASH_ATTR cgiGreetUser(HttpdConnData *connData);

const HttpdBuiltInUrl builtInUrls[]={
	ROUTE_FILESYSTEM(),
	ROUTE_END()
};

CgiStatus ICACHE_FLASH_ATTR cgiGreetUser(HttpdConnData *connData) {
	int len;			//length of user name
	char name[128];		//Temporary buffer for name
	char output[256];	//Temporary buffer for HTML output

	if (connData->requestType!=HTTPD_METHOD_GET) {
		//Sorry, we only accept GET requests.
		httpdStartResponse(connData, 406);  //http error code 'unacceptable'
		httpdEndHeaders(connData);
		return HTTPD_CGI_DONE;
	}

	//Look for the 'name' GET value. If found, urldecode it and return it into the 'name' var.
	len=httpdFindArg(connData->getArgs, "name", name, sizeof(name));
	if (len==-1) {
		//If the result of httpdFindArg is -1, the variable isn't found in the data.
		strcpy(name, "unknown person");
	} else {
		//If len isn't -1, the variable is found and is copied to the 'name' variable
	}

	//Generate the header
	//We want the header to start with HTTP code 200, which means the document is found.
	httpdStartResponse(connData, 200);
	//We are going to send some HTML.
	httpdHeader(connData, "Content-Type", "text/html");
	//No more headers.
	httpdEndHeaders(connData);

	//We're going to send the HTML as two pieces: a head and a body. We could've also done
	//it in one go, but this demonstrates multiple ways of calling httpdSend.
	//Send the HTML head. Using -1 as the length will make httpdSend take the length
	//of the zero-terminated string it's passed as the amount of data to send.
	httpdSend(connData, "<html><head><title>Page</title></head>", -1);
	//Generate the HTML body.
	len=sprintf(output, "<body><p>Hello, %s!</p></body></html>", name);
	//Send HTML body to webbrowser. We use the length as calculated by sprintf here.
	//Using -1 again would also have worked, but this is more efficient.
	httpdSend(connData, output, len);

	//All done.
	return HTTPD_CGI_DONE;
}

void webserver_task(void *pvParameters)
{

	ESP_LOGI(TAG_WEBSERVER, "webserver start\n");
	espFsInit((void*)(webpages_espfs_start));
	xEventGroupWaitBits(wifi_event_group, WIFI_EVENT_GROUP_CONNECTED_BIT, false, true, portMAX_DELAY);
	ESP_LOGI(TAG_WEBSERVER, "Webserver init.");
	httpdInit(builtInUrls, 80, HTTPD_FLAG_NONE);
	while (1) {
		vTaskDelay(5000 / portTICK_PERIOD_MS);
	}
}
