# KaliscriptCOTG
This is a script to automate the raiding and construction on Crown of the Gods.

![Kaliscript](https://i.imgur.com/ApRqvXM.png)

## Auto Raid
![AutoRaid](https://i.imgur.com/2wE9P7J.png)

###### How to use
After clicking in **analyse**, the script will filter and store the cities with the selected requirements. The number of available cities will be shown.
The number of troops sent will be according to the **carry capacity**. You can send the **exact** amount of troops matching the carry capacity or **fill** the raid with all your troops above the specified carry capacity. You can also filter the **distance** and the **level** of raids that you want to send. Choose to send to the **best** raiding field (Forest, Mountain or Hill) according to your troop type or choose to send it to the **closer** one.
###### Configurations
Selecting **exact** would let some excedent troops to be stationary in your cities, that you can use in case of emergency. The **fill** option would let you be with no troops disponible, but it's better to use **fill** if you don't run **Auto Return** constantly.

## Auto Return
![AutoReturn](https://i.imgur.com/YZtYLVw.png)

###### How to use
After clicking in **analyse**, the script will filter and show the amount of cities that you have with the specified configurations. You can choose to return the troops **now** or schedule a time to return.
###### Configurations
Set the **carry capacity** to 70~90% or less if you want to refresh the raiding by sending your troops later with a carry capacity above 100%. If you want to return your troops to war, you can set the **carry capacity** to a high amount to filter everything that you have raiding.

## Quick Setup
![QuickSetup](https://i.imgur.com/3nCTp2U.png)

###### How to use
Here you can select the design that **Auto Builder** will perform in the selected city. The designs are collected from this [sheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vSRSsLYh9ddR-4Vra6F3m1tvTzTDWCnOy2qz9U5QZy1EbnZpb9XoyBw7b6sKjZ0uWeAr5VoqY5ntXwQ/pubhtml). This tool is just an easy one-click setup to organize your cities. The **Auto Builder** needs the letter-number in remarks to read cities that need construction.

## Auto Builder
![AutoBuilder](https://i.imgur.com/a7F65wQ.png)  ![AutoBuilder](https://i.imgur.com/wVTtwCE.png)

###### How to use
The **analyse** button shows all the cities in your list of cities with the letter-number in remarks, these are the cities that need construction. Set the **maximum number of cabins** to the amount you want to build before starting the construction of the other buildings. Also set the **start demolishing cabins after** to the percentage amount of buildings level 10 you wish to have before demolishing the cabins.
The construction process will be carried out according to this schedule:
1. Demolish resource nodes
2. Build cabins until **maximum number of cabins**
3. Build other buildings until 100 buildings
4. Build wall and towers
5. Wait until **start demolishing cabins after** percentage of buildings level 10 is reached
6. Demolish 1 cabin and build 1 building until **start demolishing cabins after** percentage is not reached

Note that the script will only build cabins in the highest city squares, and the rest of the buildings will be built in the center and the lower squares.
###### Configurations
Set the **maximum number of cabins** and **start demolishing cabins after** to a lower number if you are not going to run **Auto Builder** several times a day. For a maximum efficiency, you need to run it at least 3 times a day.

## General Settings
In the first lines of code, you can edit the settings for easy access.
```javascript
    const DefaultNome = "🖤",
          MaxCabinsAutoB = 80,
          PercentageDemoCabins = 85,
          BarracksAfterAll = "checked",
          PauseAvoidKicks = "",
          AutoBuildCastle = "checked",
          AutoBuildDelay = 0,
          DelayNewCity = 0,
          AutoReturnCP = 80,
          AutoReturnDist = 5,
          AutoReturnLvl = 7,
          AutoRaidTroops = 150000,
          AutoRaidCP = 105,
          AutoRaidDist = 5,
          AutoRaidLvl = 8,
          DelayRaid = 0;
```
###### Strategy
![FirstPlace](https://i.imgur.com/kHbCSCE.png)

The script does everything automatically, requiring just one-click to start each task.

For cities construction, the best option is to build a vast number of low level cabins to acquire a huge fast construction speed. Your ministers will be working all the time if you always run the auto builder.

For raiding, the best option is to run the script as many times as possible, never leaving troops standing still. Always remember to return troops and resend them to take advantage of a carry capacity greater than 100%.
