/*********
** AutoBot
** This is a bot that plays Universal Paperclips (by Frank Lantz).
**
** To use, add <script type="text/javascript" src="bot.js"></script> to the html.
**********/

var bootstrap = true;

var wireOffer = 14;
var wireLimit = 1000;
var maxMarketing = 10;

var wireBuyerFlag = 0;
// True if we are currently saving for a big project purchase.
var saving = false;
// True if we are currently cashing out of the stock market for a big project purchase.
var bigTicketBuy = false;
var nextBuyCost = bribe;
var targetBuy = bribe;
var takeover = project37.flag == 1 || project38.flag == 1;

var inventoryMin = 1;
var maxInvestmentLevel = 10;

// Contains a list of projects that the bot will not buy.
var projectBlacklist = [
"projectButton2", // Beg for more wire
"projectButton42", // RevTracker
"projectButton26", // Auto wire buyer
"projectButton217", // Quantum Temporal Reversion
"projectButton118", // AutoTourney
"projectButton148"]; // Reject dismantling.

// List of phase 2 projects that upgrade factory or drone effectiveness.
var projectDroneUpgrade = ["projectButton110", "projectButton111", "projectButton112"];
var projectFactoryUpgrade = ["projectButton100", "projectButton101", "projectButton102"];

// Projects in the preferredProjects list are purchased in priority order.
// If 2 or more projects on the list are active, the earlier project in the list
// will be purchased first, even if the later project(s) are affordable before it.
// Projects not on this list may be purchased at any time.
var preferredProjects = [
// Phase 3
"projectButton147", // Start in a new universe
//"projectButton200", // Demand Boost
// "projectButton201", // Creativity Boost
"projectButton132", // Monument +50K honor
"projectButton133", // +10K honor
"projectButton128", // Bonus to strategic modeling (175K creativity)
// Phase 1
"projectButton51", // Photonic chip (10K ops)
"projectButton50", // Quantum computing (10K ops)
"projectButton9", // Spool 7.5K ops
"projectButton16", // Clippers 6K ops
"projectButton21", // Trading 10K ops
"projectButton12", // Jingle 4.5K ops
"projectButton34", // Hypno harmonics 7.5K ops + trust
"projectButton37", // Hostile Takeover
"projectButton38", // Full Monopoly
"projectButton40b", // Token of goodwill
];
// If true, chooses the creativity boost at the end of the game.
var chooseCBoost = Math.random() < .5;

// Helper function that resets the swarm when necessary.
function careForSwarm() {
    if (boredomFlag == 1) {
        entertainSwarm();
    }
    if (disorgFlag == 1) {
        synchSwarm();
    }
}

// Helper function to take advantage of the swarm hive mind.
function slideSwarm() {
    if (wire > 0) {
        sliderElement.value = 199;
    } else {
        sliderElement.value = 100;
    }
}

// Phase 1 Bot
// Determines whether and when to buy wire, clippers, and marketing.
// Determines whether clippers or marketing are the next purchase to save for.
var autoBuyer = setInterval(function() {
    if (humanFlag == 0) {
        return;
    }
    if (wireCost <= wireOffer && wire < (wireLimit / 10)) {
        buyWire();
        if (wire > wireLimit) {
            wireLimit = wire;
        }
    }
    // Haggle for wire.
    if (wire < (wireLimit / 10) && funds > wireOffer) {
        ++wireOffer;
    }
    // Buy auto clippers. Save funds for wire if necessary.
    if ((wire + unsoldClips) * margin > wireOffer) {
        buyClippers = !bigTicketBuy;
        nextClipperCost = 0;
        if (buyClippers) {
            // Megaclippers are always better.
            if (megaClipperFlag == 1) {
                if (funds > megaClipperCost) {
                    makeMegaClipper();
                    nextBuyCost = targetBuy;
                } else if (!saving) {
                    nextBuyCost = Math.min(nextBuyCost, megaClipperCost);
                }
                nextClipperCost = megaClipperCost;
            } else {
                // There's a race when there are enough funds for the first clipper. Add a fudge factor to make sure the button appears.
                if ((clipmakerLevel > 0 && funds > clipperCost) || funds > (clipperCost * 1.1)) {
                    makeClipper();
                    nextBuyCost = targetBuy;
                } else {
                   nextBuyCost = Math.min(nextBuyCost, clipperCost);
                }
                nextClipperCost = clipperCost;
            }
        }
        if ((!buyClippers || adCost < nextClipperCost) && marketingLvl < maxMarketing) {
            if (funds > adCost) {
                buyAds();
                nextBuyCost = targetBuy;
            } else {
                nextBuyCost = Math.min(nextBuyCost, adCost);
            }
        }

        if (marketingLvl >= maxMarketing && (!buyClippers || takeover)) {
            nextBuyCost = targetBuy;
        }
    }

}, 10);

// Paperclip button masher for phase 1. Only used to bootstrap until the
// bot buys auto clippers.
var clipMasher = setInterval(function() {
    // Mash paperclip button to bootstrap.
    if (humanFlag == 1 && clipmakerLevel == 0) {
        clipClick(1);
    }
}, 1000);

// Purchases projects.
var autoProjectPurveyor = setInterval(function () {
    // Prefers the projects that come first in the preferredProjects list.
    if (project200.flag == 1 || project201.flag == 1) {
        return;
    }
    var stockVal = 0;
    for (var i = 0; i < stocks.length; i++) {
        stockVal += stocks[i].total;
    }
    targetBuy = 100000000000;
    if (project37.flag == 1 && project38.flag == 1) {
        targetBuy = bribe * (Math.pow(2, (100 - trust))-1);
        saving = true;
        if (funds + bankroll + stockVal >= targetBuy) {
                bigTicketBuy = true;
        }
    }
    for (var i = 0; i < preferredProjects.length; i++) {
        found = activeProjects.find(function(element) {
            return element.id == preferredProjects[i]});
        if (!found) {
            continue;
        }
        // Takeover investment calculations.
        if (found.id == "projectButton37") {
            targetBuy = Math.min(targetBuy, 1000000);
            saving = true;
            if (funds + bankroll + stockVal >= 1000000) {
                bigTicketBuy = true;
            }
            if (found.cost()) {
                takeover = true;
                saving = false;
                bigTicketBuy = false;
            }
        } else if (found.id == "projectButton38") {
            targetBuy = Math.min(targetBuy, 10000000);
            takeover = false;
            saving = true;
            if (funds + bankroll + stockVal >= 10000000) {
                bigTicketBuy = true;
            }
            if (found.cost()) {
                takeover = true;
                saving = false;
                bigTicketBuy = false;
            }
        }
        if (found.cost()) {
            console.log("Bought preferred project: " + found.id + " " + found.title + " in " + timeCruncher(ticks));
            found.effect();
            return;
        }

        // Only wait for one photonics chip.
        if (found.id == "projectButton51" && found.flag == 1) {
            continue;
        }
        break;
    }
    // 50/50 at getting creativity or demand boost.
    if (activeProjects.includes(project201)) {
        console.log("Choosing the end game");
        if (chooseCBoost) {
            if (project201.cost()) {
                project201.effect();
            }
        } else if (project200.cost()) {
            project200.effect();
        }
    }
    for (var i = 0; i < activeProjects.length; i++) {
        if (projectBlacklist.includes(activeProjects[i].id) || preferredProjects.includes(activeProjects[i].id)) {
            continue;
        }
        // The final factory upgrade costs 1 sextillion clips. Cover the cost using the existing factories.
        if (activeProjects[i].id == "projectButton102") {
            if ((unusedClips + factoryBill + harvesterBill + wireDroneBill + farmBill) > 1000000000000000000000) {
                factoryReboot();
                harvesterReboot();
                wireDroneReboot();
                farmReboot();
            }
        }
        if (activeProjects[i].cost()) {
            if (humanFlag == 0 && spaceFlag == 0) {
                if (projectDroneUpgrade.includes(activeProjects[i].id)) {
                    harvesterReboot();
                    wireDroneReboot();
                    console.log("reset drones");
                }
                if (projectFactoryUpgrade.includes(activeProjects[i].id)) {
                    factoryReboot();
                    console.log("reset factories");
                }
            }
            console.log("Bought project: " + activeProjects[i].id + " " + activeProjects[i].title + " in " + timeCruncher(ticks));

            activeProjects[i].effect();

            return;
        }
    }
}, 10);

// Allocates trust to processors and memory.
var autoTrust = setInterval(function() {
    if (trust <= (memory + processors) && swarmGifts <= 0) {
        return;
    }
    var maxMemory = 50;
    if (humanFlag == 0) {
        maxMemory = 70;
    }
    if (spaceFlag == 1) {
        maxMemory = 150;
    }

    while ((memory + processors) < trust || swarmGifts > 0) {
        if (memory >= maxMemory) {
            addProc();
            continue;
        }
        lockstep = processors < 5 || qChips[0].active == 1;
        if (lockstep) {
            if (memory < processors) {
                addMem();
                continue;
            } else {
                addProc();
                continue;
            }
        } else {
            addMem();
            continue;
        }

    }
}, 1000);

// Phase 2 bot.
var empireBuilder = setInterval(function() {

    if (humanFlag == 1 || spaceFlag == 1) {
        return;
    }
    // Don't bother if none of the manufacturing elements are available yet. Wait for the ops to be available.
    if (harvesterFlag == 0 || wireDroneFlag == 0 || factoryFlag == 0 || tothFlag == 0) {
        return;
    }

    if (bootstrap) {
        if (farmLevel >= 5) {
            bootstrap = false;
            return;
        }
        if (farmLevel == 0) {
            makeFarm(1);
            makeHarvester(1);
            makeWireDrone(1);
        }
        if (wire > 25000000000 && batteryLevel == 0) {
            harvesterReboot();
            wireDroneReboot();
            makeBattery(1);
        }
        if (factoryLevel == 0 && storedPower > 10) {
            farmReboot(); 
            makeFactory();
        }
        if (factoryLevel == 1 && unusedClips > farmCost) {
            makeFarm(1);
        }
    }

    // Disassemble if resources are gone.
    if (availableMatter == 0) {
        harvesterReboot();
        if (acquiredMatter == 0) {
            wireDroneReboot();
            if (wire == 0) {
                factoryReboot();
            }
        }
    }

    var hDrone = {
        name: "harv",
        amount: function() { 
            if (unusedClips > (harvesterCost * 1000000000)) {
                return 1000;
            }
            if (unusedClips > (harvesterCost * 1000000)) {
                return 100;
            }
            if (unusedClips > (harvesterCost * 1000)) {
                return 10;
            }
            return 1;
        },
        build: function() { makeHarvester(hDrone.amount()); },
        cost: harvesterCost,
        power: function() { return hDrone.amount() * dronePowerRate/100; },
    }
    var wDrone = {
        name: "wire",
        amount: function() { 
            if (unusedClips > (wireDroneCost * 1000000000)) {
                return 1000;
            }
            if (unusedClips > (wireDroneCost * 1000000)) {
                return 100;
            }
            if (unusedClips > (wireDroneCost * 1000)) {
                return 10;
            }
            return 1;
        },
        build: function() { makeWireDrone(wDrone.amount()); },
        cost: wireDroneCost,
        power: function () { return wDrone.amount() * dronePowerRate/100; },
    }
    var cFactory = {
        name: "factory",
        build: function() { makeFactory(); },
        cost: factoryCost,
        power: function() { return factoryPowerRate/100; },
        amount: function() { return 1; },
    }
    var sBattery = {
        name: "battery",
        amount: function() { return 1; },
        build: function() { makeBattery(sBattery.amount()); },
        cost: batteryCost,
        power: function() { return 0; },
    }

    // Determine goal: Buy factory, drones, or battery. Where is the bottleneck? Bootstrap with drones.
    var supply = farmLevel * farmRate/100;
    var hDemand = (harvesterLevel * dronePowerRate/100)
    var wDemand = (wireDroneLevel * dronePowerRate/100);
    var fDemand = (factoryLevel * factoryPowerRate/100);
    var demand = hDemand + wDemand + fDemand;
    var cap = batteryLevel * batterySize;
    var deficit = 0;

    // TODO: Stop building dones at some point?
    // If "projectButton46" is in active projects, then focus on storage to 10M.
    var nextBuild = [];
    if ( storedPower >= cap && cap < 10000000) {
        nextBuild.push(sBattery);
        if ((supply - demand) > 10000) {
            nextBuild[0].amount = function() { return (supply - demand) / 10000; };
        }
    } else if (wire > 0) {
        // Prioritize Chip factory.
        nextBuild.push(cFactory);
    } else if (acquiredMatter > 0) {
        // Prioritize wire drone.
        nextBuild.push(wDrone);
    } else if (availableMatter > 0) {
        nextBuild.push(hDrone);
    }

    if (nextBuild.length == 0) {
        return;
    }
    var farmsNeeded = Math.ceil(((demand + nextBuild[0].power() - supply) / (farmRate / 100)));
    // If not enough energy is available, buy the necessary solar plants (if there's enough clips).
    if (unusedClips > (farmCost * farmsNeeded) && supply < (demand + nextBuild[0].power())) {
        makeFarm(farmsNeeded);
        // Supply has changed, so update supply.
        supply = farmLevel * farmRate/100;
    }
    
    // Buy the goal, if there's enough clips.
    if (supply >= (demand + nextBuild[0].power()) && unusedClips > nextBuild[0].cost) {
        nextBuild[0].build();
    }

    // Activate slider if there's a factory bottleneck.
    slideSwarm();

    // Entertain swarm if necessary
    careForSwarm();
}, 1);

// Phase 3 bot.
var spaceDroneOperator = setInterval(function() {
    if (humanFlag == 1 || spaceFlag == 0) {
        return;
    }
    
    if (honor >= maxTrustCost) {
        increaseMaxTrust();
    }
    while (yomi > probeTrustCost && probeTrust < maxTrust) {
        increaseProbeTrust();
    }

    var mode = {speed: 0, nav: 0, rep: 0, haz: 0, fac: 0, harv: 0, wire: 0, combat: 0};
        // Adjust allocations.
        alloc = probeTrust;
        if (availableMatter == 0) {
            mode.nav = 1;
            --alloc;
            mode.harv = 0;
        } else {
            mode.nav = 0;
            mode.harv = 1;
            --alloc;
        }
        if (wire > 0) {
            mode.fac = 1;
            --alloc;
        } else {
            mode.fac = 0;
        }
        if (acquiredMatter > 0) {
            mode.wire = 1;
            --alloc;
        } else {
            mode.wire = 0;
        }
        if (battleFlag == 1) {
            mode.combat = 3;
            mode.speed = 2;
            alloc = alloc - 5;
        } else if (availableMatter == 0) {
            mode.speed = 1;
            --alloc;
        }
        mode.haz = Math.min(5, alloc);
        alloc = alloc - Math.min(5, alloc);
        // allocate extra to exploration
        while (alloc > 10 && (mode.speed < 4 || mode.nav < 4)) {
            if (mode.speed < 4) {
                ++ mode.speed;
                --alloc;
            }
            if (mode.nav < 4) {
                ++mode.nav;
                --alloc;
            }
        }
        mode.rep = alloc;
    
    while (probeHaz > mode.haz) lowerProbeHaz();
    while (probeFac > mode.fac) lowerProbeFac();
    while (probeHarv > mode.harv) lowerProbeHarv();
    while (probeWire > mode.wire) lowerProbeWire();
    while (probeRep > mode.rep) lowerProbeRep();
    while (probeHaz > mode.haz) lowerProbeHaz();
    while (probeSpeed > mode.speed) lowerProbeSpeed();
    while (probeNav > mode.nav) lowerProbeNav();
    while (probeCombat >mode.combat) lowerProbeCombat();

    usedTrust = (probeSpeed+probeNav+probeRep+probeHaz+probeFac+probeHarv+probeWire+probeCombat);

    // Fix any deviations from ideal design.
    while (probeHaz < mode.haz && usedTrust < probeTrust) {
            raiseProbeHaz();
            ++usedTrust;
        
    }
    if (battleFlag == 1) {
        while (probeCombat < mode.combat && usedTrust < probeTrust) {
            raiseProbeCombat();
            ++usedTrust;
        }
    }
    while (probeRep < mode.rep && usedTrust < probeTrust) {
            raiseProbeRep();
            ++usedTrust;
    }
    while (probeSpeed < mode.speed && usedTrust < probeTrust) {
            raiseProbeSpeed();
            ++usedTrust;
    }
    while (probeNav < mode.nav && usedTrust < probeTrust) {
            raiseProbeNav();
            ++usedTrust;
    }
    while (probeFac < mode.fac && usedTrust < probeTrust) {

            raiseProbeFac();
            ++usedTrust;
    }
    while (probeHarv < mode.harv && usedTrust < probeTrust) {
            raiseProbeHarv();
            ++usedTrust;
    }
    while (probeWire < mode.wire && usedTrust < probeTrust) {

            raiseProbeWire();
            ++usedTrust;
    }

    // Activate slider if there's a factory bottleneck.
    slideSwarm()

    // Take care of swarm.
    careForSwarm();

    // Mash launch probe to bootstrap.
    if (probeCount < 100) {
        makeProbe();
    }
}, 10);

// Mashes the quantum computer button when active. Ops FTW!
var quantumMasher = setInterval(function() {
    qSum = 0;
    for (var i = 0; i<qChips.length; i++){
        if (qChips[i].active) {
            qSum = qSum + qChips[i].value;
        }
    }
    if (qSum > 0) {
        qComp();
    }   
}, 1);

// Maximize revenue per second without going broke. Keep an inventory buffer.
var autoBalancer = setInterval(function() {
    if ((avgSales > clipRate || unsoldClips < inventoryMin) && clipRate > 0) {
        raisePrice();
    } else if (margin > .01 && unsoldClips > inventoryMin && clipRate != 0) {
        lowerPrice();
    }
    inventoryMin = Math.ceil(avgSales * 5);
}, 1000);

// Invests in the stock market when there's something to save up for.
var autoQuant = setInterval(function() {
    if (investmentEngineFlag == 0) {
        return;
    }
    var stockVal = 0;
    for (var i = 0; i < stocks.length; i++) {
        stockVal += stocks[i].total;
    }
    var readyToBuy = (bankroll + stockVal + funds) > (nextBuyCost + wireOffer);

    // Holding pattern if we've done hostile takeover but haven't started bribes yet.
    var hold = takeover && project40.flag == 0;
    if (readyToBuy && !hold) {
        investStratElement.value="low";
    } else if (investLevel > 4) {
        investStratElement.value="high";
    } else {
        investStratElement.value="med";
    }
    var wireMargin = (wire + unsoldClips) * margin;
    // Inject some randomness, otherwise we may either not have any money in the stock market
    // to invest, or we may invest too frequently to buy a reasonable amount of clippers.
    buyDespiteHold = Math.random() < .1;
    buyDespiteRTB = Math.random() < .25;
    if ((!hold || buyDespiteHold) && (!readyToBuy && (hold || buyDespiteRTB))  && wireMargin > wireOffer) {
        investDeposit();
    }
    if (!hold && readyToBuy) {
        investWithdraw();
    }
    if (yomi > investUpgradeCost && investLevel < maxInvestmentLevel) {
        investUpgrade();
    }
}, 2000);

// Plays the game.
var autoGamer = setInterval(function() {
    // Always pick beats last.
    // TODO: Implement smarter game player.
    if (strats.length > 7 && operations >= tourneyCost && tourneyInProg == 0) {
        newTourney();
        // Pick a strategy
        stratPickerElement.value = 7;
        runTourney();
    }
}, 1000);
