/********************************** (C) COPYRIGHT *******************************
 * File Name          : CONFIG.h
 * Author             : WCH
 * Version            : V1.2
 * Date               : 2022/01/18
 * Description        : Configuration parameter default values, can be modified by defining
 *                      preprocessor symbols before compiling to change current values
 *********************************************************************************
 * Copyright (c) 2021 Nanjing Qinheng Microelectronics Co., Ltd.
 * Attention: This software (modified or not) and binary are used for 
 * microcontroller manufactured by Nanjing Qinheng Microelectronics.
 *******************************************************************************/

/******************************************************************************/
#ifndef __CONFIG_H
#define __CONFIG_H

#define	ID_CH592							0x92

#define CHIP_ID								ID_CH592

#ifdef CH59xBLE_ROM
#include "CH59xBLE_ROM.h"
#else
#include "CH59xBLE_LIB.h"
#endif

#include "CH59x_common.h"

/*********************************************************************
 MAC Configuration:
 BLE_MAC                                    - Whether to customize Mac address (Default: FALSE - use chip Mac address),
                                              need to modify Mac address in main.c

 DCDC Configuration:
 DCDC_ENABLE                                - Whether to enable DCDC (Default: FALSE)

 SLEEP Configuration:
 HAL_SLEEP                                  - Whether to enable sleep function (Default: FALSE)
 SLEEP_RTC_MIN_TIME                         - Minimum sleep time in idle mode (unit: one RTC cycle)
 SLEEP_RTC_MAX_TIME                         - Maximum sleep time in idle mode (unit: one RTC cycle)
 WAKE_UP_RTC_MAX_TIME                       - Wait time for 32M crystal stabilization (unit: one RTC cycle)
                                              Values vary by sleep mode: Sleep/Shutdown mode - 45 (Default)
                                                                         Halt mode - 45
                                                                         Idle mode - 5
 TEMPERATURE:
 TEM_SAMPLE                                 - Whether to enable temperature change calibration (calibration time < 10ms) (Default: TRUE)

 CALIBRATION:
 BLE_CALIBRATION_ENABLE                     - Whether to enable periodic calibration (calibration time < 10ms) (Default: TRUE)
 BLE_CALIBRATION_PERIOD                     - Periodic calibration interval, unit: ms (Default: 120000)

 SNV (Simple Non-Volatile Storage):
 BLE_SNV                                    - Whether to enable SNV function for storing bonding information (Default: TRUE)
 BLE_SNV_ADDR                               - SNV information storage address, uses 512 bytes of data flash (Default: 0x77E00)
 BLE_SNV_BLOCK                              - SNV information block size (Default: 256)
 BLE_SNV_NUM                                - SNV information block count (Default: 1)

 RTC Configuration:
 CLK_OSC32K                                 - RTC clock selection, low power mode uses external 32K
                                              (0: External 32768Hz, Default: 1: Internal 32000Hz, 2: Internal 32768Hz)

 MEMORY Configuration:
 BLE_MEMHEAP_SIZE                           - RAM size used by BLE protocol stack, minimum 6K (Default: 1024*6)

 DATA Configuration:
 BLE_BUFF_MAX_LEN                           - Single connection data packet length (Default: 27 (ATT_MTU=23), range [27~516])
 BLE_BUFF_NUM                               - Single connection data packet count (Default: 5)
 BLE_TX_NUM_EVENT                           - Number of data packets that can be sent per connection event (Default: 1)
 BLE_TX_POWER                               - Transmit power (Default: LL_TX_POWEER_0_DBM (0dBm))

 MULTICONN (Multi-Connection):
 PERIPHERAL_MAX_CONNECTION                  - Maximum number of simultaneous peripheral roles (Default: 1)
 CENTRAL_MAX_CONNECTION                     - Maximum number of simultaneous central roles (Default: 3)

 **********************************************************************/

/*********************************************************************
 * Default configuration values
 */
#ifndef BLE_MAC
#define BLE_MAC                             FALSE
#endif
#ifndef DCDC_ENABLE
#define DCDC_ENABLE                         TRUE
#endif
#ifndef HAL_SLEEP
#define HAL_SLEEP                           FALSE
#endif
#ifndef SLEEP_RTC_MIN_TIME                   
#define SLEEP_RTC_MIN_TIME                  US_TO_RTC(1000)
#endif
#ifndef SLEEP_RTC_MAX_TIME                   
#define SLEEP_RTC_MAX_TIME                  (RTC_MAX_COUNT - 1000 * 1000 * 30)
#endif
#ifndef WAKE_UP_RTC_MAX_TIME
#define WAKE_UP_RTC_MAX_TIME                US_TO_RTC(1600)
#endif
#ifndef HAL_KEY
#define HAL_KEY                             FALSE
#endif
#ifndef HAL_LED
#define HAL_LED                             FALSE
#endif
#ifndef TEM_SAMPLE
#define TEM_SAMPLE                          TRUE
#endif
#ifndef BLE_CALIBRATION_ENABLE
#define BLE_CALIBRATION_ENABLE              TRUE
#endif
#ifndef BLE_CALIBRATION_PERIOD
#define BLE_CALIBRATION_PERIOD              120000
#endif
#ifndef BLE_SNV
#define BLE_SNV                             TRUE
#endif
#ifndef BLE_SNV_ADDR
#define BLE_SNV_ADDR                        0x77E00-FLASH_ROM_MAX_SIZE
#endif
#ifndef BLE_SNV_BLOCK
#define BLE_SNV_BLOCK                       256
#endif
#ifndef BLE_SNV_NUM
#define BLE_SNV_NUM                         1
#endif
#ifndef CLK_OSC32K
#define CLK_OSC32K                          1   // Cannot be modified here, must be modified by defining preprocessor symbols before compiling; low power mode uses external 32K
#endif
#ifndef BLE_MEMHEAP_SIZE
#define BLE_MEMHEAP_SIZE                    (1024*6)
#endif
#ifndef BLE_BUFF_MAX_LEN
#define BLE_BUFF_MAX_LEN                    27
#endif
#ifndef BLE_BUFF_NUM
#define BLE_BUFF_NUM                        5
#endif
#ifndef BLE_TX_NUM_EVENT
#define BLE_TX_NUM_EVENT                    1
#endif
#ifndef BLE_TX_POWER
#define BLE_TX_POWER                        LL_TX_POWEER_0_DBM
#endif
#ifndef PERIPHERAL_MAX_CONNECTION
#define PERIPHERAL_MAX_CONNECTION           1
#endif
#ifndef CENTRAL_MAX_CONNECTION
#define CENTRAL_MAX_CONNECTION              3
#endif


extern uint32_t MEM_BUF[BLE_MEMHEAP_SIZE / 4];
extern const uint8_t MacAddr[6];

#endif

