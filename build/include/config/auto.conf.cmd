deps_config := \
	/home/zulolo/esp-idf/components/app_trace/Kconfig \
	/home/zulolo/esp-idf/components/aws_iot/Kconfig \
	/home/zulolo/esp-idf/components/bt/Kconfig \
	/home/zulolo/esp-idf/components/esp32/Kconfig \
	/home/zulolo/esp-idf/components/ethernet/Kconfig \
	/home/zulolo/esp-idf/components/fatfs/Kconfig \
	/home/zulolo/esp-idf/components/freertos/Kconfig \
	/home/zulolo/esp-idf/components/heap/Kconfig \
	/home/zulolo/esp-idf/components/libsodium/Kconfig \
	/home/zulolo/esp-idf/components/log/Kconfig \
	/home/zulolo/esp-idf/components/lwip/Kconfig \
	/home/zulolo/esp-idf/components/mbedtls/Kconfig \
	/home/zulolo/esp-idf/components/openssl/Kconfig \
	/home/zulolo/esp-idf/components/pthread/Kconfig \
	/home/zulolo/esp-idf/components/spi_flash/Kconfig \
	/home/zulolo/esp-idf/components/spiffs/Kconfig \
	/home/zulolo/esp-idf/components/tcpip_adapter/Kconfig \
	/home/zulolo/esp-idf/components/wear_levelling/Kconfig \
	/home/zulolo/esp-idf/components/bootloader/Kconfig.projbuild \
	/home/zulolo/esp-idf/components/esptool_py/Kconfig.projbuild \
	/home/zulolo/esp-idf/components/partition_table/Kconfig.projbuild \
	/home/zulolo/esp-idf/Kconfig

include/config/auto.conf: \
	$(deps_config)


$(deps_config): ;
