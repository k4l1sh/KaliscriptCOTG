// ==UserScript==
// @name         Kaliscript
// @description  A script to automate the progression on Crown of the Gods
// @copyright    Kalish, 2020
// @namespace    http://tampermonkey.net/
// @version      1.0
// @license      MIT
// @author       Kalish
// @match        https://*.crownofthegods.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

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

    var ContinuarAutoBuilder, ContinuarAutoRaid, RaidOnlyThis, TempoDecorrido, NumCidadesTo, NumRaidsTo, CidadesDisp=[], CidadesToRaid=[];
    const TropaType = ["Guard","Ballista","Ranger","Triari","Priestess","Vanquisher","Sorcerer", "Scout","Arbalist","Praetor","Horseman","Druid","Ram","Scorpion","Galley","Stinger","Warship"],
          TropaCarga = {Guard:0,Warship:3000,Druid:10,Priestess:10,Horseman:15,Scorpion:0,Sorcerer:5,Ballista:0,Scout:0,Praetor:20,Ranger:10,Arbalist:15,Ram:0,Vanquisher:10,Stinger:1500,Senator:0,Galley:1000,Triari:20},
          RaidLoote = [0,400,1000,4500,15000,33000,60000,120000,201000,300000,446000],
          TropaTipo = {Vanquisher:"Inf",Ranger:"Inf",Triari:"Inf",Arbalist:"Cav",Horseman:"Cav",Sorcerer:"Mys",Druid:"Mys",Priestess:"Inf",Praetor:"Cav",Stinger:"Nav",Galley:"Gal",Warship:"Nav"},
          TropaSpaceh = {Guard:0,Vanquisher:1,Ranger:1,Triari:1,Scout:2,Arbalist:2,Horseman:2,Sorcerer:1,Druid:2,Priestess:1,Praetor:2,Ram:10,Ballista:10,Scorpion:10,Stinger:100,Galley:100,Warship:400,Senator:1},
          VelTropas = {Scout:8,Horseman:10,Druid:10,Praetor:10,Arbalist:10,Vanquisher:20,Sorcerer:20,Ranger:20,Triari:20,Priestess:20,Ram:30,Ballista:30,Scorpion:30,Senator:40,Stinger:5,Galley:5,Warship:5},
          bdid = {f:448,c:446,r:464,s:461,q:479,a:447,u:504,b:445,i:465,t:483,m:449,v:481,l:460,e:466,h:462,w:500,g:463,y:482,x:467,z:477,k:502,o:490,p:498,0:809,1:547,2:543,3:539,4:551,5:555,6:567,7:559,8:563,9:571},
          ResearchValores = [0,1,3,6,10,15,20,25,30,35,40,45,50];
    const coordsb = [134,135,136,137,138,
                 154,155,156,157,158,159,160,
             174,175,176,177,178,179,180,181,182,
             195,196,197,198,199,200,201,202,203,
               216,217,218,219,221,222,223,224,
             237,238,239,240,241,242,243,244,245,
             258,259,260,261,262,263,264,265,266,
                 280,281,282,283,284,285,286,
                     302,303,304,305,306,
    232,233,234,235,
    253,254,255,256,
    274,275,276,277,
    295,296,297,298,299,
    316,317,318,319,320,321,
    337,338,339,340,341,342,343,344,345,
    358,359,360,361,362,363,364,365,366,
        380,381,382,383,384,385,386,387,
            402,403,404,405,406,407,408,
                                                                    247,248,249,250,
                                                                    268,269,270,271,
                                                                    289,290,291,292,
                                                                309,310,311,312,313,
                                                            329,330,331,332,333,334,
                                                347,348,349,350,351,352,353,354,355,
                                                368,369,370,371,372,373,374,375,376,
                                                389,390,391,392,393,394,395,396,
                                                410,411,412,413,414,415,416];
    const coordsc = [24,25,26,27,28,29,30,
                   44,45,46,47,48,49,50,51,
                64,65,66,67,68,69,70,71,72,
                85,86,87,88,89,90,91,92,93,
                106,107,108,109,110,111,
                127,128,129,130,131,
                148,149,150,151,
                169,170,171,172,
                190,191,192,193,
                                                     32,33,34,35,36,37,38,
                                                     53,54,55,56,57,58,59,60,
                                                     74,75,76,77,78,79,80,81,82,
                                                     95,96,97,98,99,100,101,102,103,
                                                            119,120,121,122,123,124,
                                                                141,142,143,144,145,
                                                                    163,164,165,166,
                                                                    184,185,186,187,
                                                                    205,206,207,208];

    function CarregarPlanilha(sheet) {
        return fetch(sheet)
            .then(response => response.text())
            .then(html => {
            let nome, data = new Array(), planilha = new DOMParser().parseFromString(html, "text/html");
            planilha.querySelectorAll(".waffle > tbody").forEach((tbody,tabela) => {
                nome = planilha.querySelector("#sheet-menu") ? planilha.querySelectorAll("#sheet-menu > li > a")[tabela].innerHTML : planilha.querySelector("#doc-title > span").innerHTML.split(": ")[1];
                data[nome] = new Array();
                tbody.querySelectorAll("tr").forEach((tr,linha) => {
                    data[nome].push([]);
                    tr.querySelectorAll("td").forEach(td => {
                        if(td.innerHTML) data[nome][linha].push(td.innerHTML);
                        else data[nome][linha].push("");
                    });
                });
            });
            return data;
        });
    }

    function ReportBar(now,until,nome,destinyelement,tamanho=280) {
        $(destinyelement).html("<div style='width:"+tamanho+"px;background-color:white;line-height:28px;border:1px solid black;margin-bottom:2px;'><div style='text-align:center;display:table-cell;vertical-align:middle;height:28px;background-color:green;width:"+Math.floor(now/until*tamanho)+"px;color:black;'><p style='transform:translate(0,4px)'>"+Math.floor(now/until*100)+"%</p></div></div>"+nome);
    }

    function miniload(valor,texto,elemento="#resultsautobuild",continuar=ContinuarAutoBuilder,tamanho=280) {
        let curload = 1;
        var loading = setInterval(function() {
            if (curload < 101 && continuar) {
                ReportBar(valor*curload/100, valor, texto, elemento, tamanho);
                curload++;
            }
            else {clearInterval(loading);}
        }, valor*curload/100);
    }

    function AnalisarCidades() {
        CidadesDisp = []; NumCidadesTo = 0;
        CarregarPlanilha("https://docs.google.com/spreadsheets/d/e/2PACX-1vSRSsLYh9ddR-4Vra6F3m1tvTzTDWCnOy2qz9U5QZy1EbnZpb9XoyBw7b6sKjZ0uWeAr5VoqY5ntXwQ/pubhtml").then(ddata => {
            Object.keys(cotg.player.citylist(0)).map(id => {return cotg.player.citylist(0)[id].name}).forEach((cidade,chave) => {
                let istobuild = cidade.match(/(^|\s)[a-zA-Z]\d(\s|$)/g);
                if(istobuild) {
                    for (const design in ddata) {
                        if(istobuild.toString().includes(design)) CidadesDisp.push({cid:Number(Object.keys(cotg.player.citylist(0))[chave]), design:design, name:ddata[design][1][22], data:ddata[design]});
                    }
                }
            });
            if(CidadesDisp.length) {
                NumCidadesTo = CidadesDisp.length;
                $("#ResultadosOfAnalysis").html("<font color='green'>"+CidadesDisp.length+" cities to build<br/>Estimated time to spend building: "+Math.floor((9+DelayNewCity/1000+AutoBuildDelay/4000+(1+AutoBuildDelay/2000)*13)*(CidadesDisp.length+1)/60)+"min"+(9+DelayNewCity/1000+AutoBuildDelay/4000+(1+AutoBuildDelay/2000)*13)*(CidadesDisp.length+1)%60+"s</font>");
                $("#AfterAnalysis").show();
                CidadesDisp.sort(() => Math.random()-0.5);
            }
            else {
                $("#ResultadosOfAnalysis").html("0 cities to build<br/>Run Quick Setup in cities you want to build");
                $("#AfterAnalysis").hide();
            }
        });
    }

    function FinishAutoBuilder() {
        ReportBar(1,1,Math.floor((Date.now()-TempoDecorrido.getTime())/60000)+"min"+Math.floor((Date.now()-TempoDecorrido.getTime())/1000%60)+"s elapsed","#resultsautobuild");
        ContinuarAutoBuilder=false;
    }

    function NextCidade(shift=false, start=false) {
        let aleatGotoNext = Math.random()*AutoBuildDelay;
        if(start) {
            CidadesDisp.forEach((cd,id) => {
                if(cd.cid == Number($("#cityDropdownMenu option:selected").val())) {
                    CidadesDisp.splice(id,1);
                    CidadesDisp.unshift(cd);
                }
            });
        }
        if(shift) CidadesDisp.shift();
        ReportBar((NumCidadesTo-CidadesDisp.length),NumCidadesTo,CidadesDisp.length+" cities to build","#ResultadosOfAnalysis");
        if(CidadesDisp.length) {
            miniload(3000+aleatGotoNext, "Going to next city");
            setTimeout(() => {
                $("#ImaginaryButtonGOB").attr("a", CidadesDisp[0].cid)[0].click();
            }, 3000+aleatGotoNext);
        }
        else FinishAutoBuilder();
        if($("#PauseToAvoidKicks").is(":checked") && (Date.now()-TempoDecorrido.getTime()) >= 60000) {
            ContinuarAutoBuilder=false;
            setTimeout(FinishAutoBuilder,1000);
            setTimeout(() => {ReportBar(1,1,"Paused to avoid disconnection<br/>Will resume soon","#resultsautobuild");},10000);
            setTimeout(() => {TempoDecorrido = new Date();NextCidade(false,true);ContinuarAutoBuilder=true;miniload(3000, "Resuming");},90000);
        }
    }

    (function(open) {
        XMLHttpRequest.prototype.open = function() {
            this.addEventListener("readystatechange", function() {
                if(this.readyState == 4) {
                    var url = this.responseURL;
                    if ((url.indexOf("gC.php") != -1 || url.indexOf("nBuu.php") != -1) && ContinuarAutoBuilder) {
                        var cdata = JSON.parse(this.response);
                        if(cdata.bq.length < 15) {
                            let initime = (url.indexOf('gC.php')!=-1) ? (3000+DelayNewCity) : 1000;
                            var bdata = {isbuilding:[],istower:[],iscabin:[],isstorehouse:[],isbarracks:[],barracksall:[],buildingsall:[],towersall:[],buildingsbid:[],resourcesb:[],bqueue:[],dqueue:[],buildingsbuilt:[],cabinsbuilt:[],towersbuilt:[],buildingsmaxlvl:[],wallbuilt:false};
                            let ncidade = CidadesDisp.map(n => {return n.cid}).indexOf(cdata.cid)
                            if(ncidade != -1) {
                                CidadesDisp[ncidade].data.forEach((y,linha) => {
                                    y.forEach((x,coluna) => {
                                        if(coluna < 21) {
                                            bdata.buildingsbid.push(bdid[x]);
                                            if (x != "" && !(x == "x" && !$("#ConfirmeCastleAutoB").is(":checked"))) {
                                                if(isNaN(x)) {
                                                    if($("#BarracksPorUlt").is(":checked") && x == "b") bdata.barracksall.push(linha*21+coluna);
                                                    else bdata.buildingsall.push(linha*21+coluna);
                                                }
                                                else bdata.towersall.push(linha*21+coluna);
                                            }
                                        }
                                    });
                                });
                                bdata.buildingsall = bdata.buildingsall.concat(bdata.barracksall);
                                cdata.bq.forEach(cexist => {
                                    if([451,452,453,454].includes(cexist.btype) || cexist.elvl != 0) bdata.bqueue.push(cexist.bspot);
                                    else bdata.dqueue.push(cexist.bspot);
                                });
                                cdata.bd.forEach((bexist,pos) => {
                                    if (bexist.bd == 7200000 && !bdata.bqueue.includes(pos) && bdata.buildingsall.includes(pos)) bdata.resourcesb.push(pos);
                                    else if (bexist.bd == 0 && !bdata.bqueue.includes(pos) && coordsc.includes(pos) && !bdata.dqueue.includes(pos)) bdata.iscabin.push(pos);
                                    else if (bexist.bd == 0 && !bdata.bqueue.includes(pos) && (bdata.buildingsall.includes(pos) || bdata.barracksall.includes(pos))) {
                                        if (!$("#BarracksPorUlt").is(":checked")) bdata.isbuilding.push(pos);
                                        else if (bdata.buildingsbid[pos] != 445 && $("#BarracksPorUlt").is(":checked")) bdata.isbuilding.push(pos);
                                        if (bdata.buildingsbid[pos] == 464) bdata.isstorehouse.push(pos);
                                        else if (bdata.buildingsbid[pos] == 445 && $("#BarracksPorUlt").is(":checked")) bdata.isbarracks.push(pos);
                                    }
                                    else if (bexist.bd == 0 && !bdata.bqueue.includes(pos) && bdata.towersall.includes(pos) && pos != 0) bdata.istower.push(pos);
                                    if (bexist.bd != 7200000 && bexist.bd != 0 && coordsb.includes(pos)) {
                                        bdata.buildingsbuilt.push(pos);
                                        if(bexist.bl == 10) bdata.buildingsmaxlvl.push(pos);
                                    }
                                    else if (bexist.bd != 7200000 && bexist.bd != 0 && coordsc.includes(pos) && !bdata.bqueue.includes(pos) && !bdata.dqueue.includes(pos)) bdata.cabinsbuilt.push(pos);
                                    else if ((bexist.bd != 0 || bdata.bqueue.includes(pos)) && bdata.towersall.includes(pos) && pos == 0) bdata.wallbuilt=true;
                                    else if (bexist.bd != 0 && bdata.towersall.includes(pos) && pos != 0) bdata.towersbuilt.push(pos);
                                });
                                if((bdata.buildingsbuilt.length+bdata.cabinsbuilt.length+bdata.bqueue.length) > $("#MaxCabinsToBuildB").val()) bdata.iscabin.length = 0;
                                let aleatorizarautob = Math.random()*AutoBuildDelay,
                                    buildingscompleted = bdata.buildingsmaxlvl.length/bdata.buildingsbuilt.length*100 || 0,
                                    CabinsToBuild = Math.max(Math.min($("#MaxCabinsToBuildB").val()-bdata.cabinsbuilt.length-bdata.bqueue.length,bdata.iscabin.length),0);
                                ReportBar((NumCidadesTo-CidadesDisp.length+cdata.bq.length/15),NumCidadesTo,CidadesDisp.length+" cities to build","#ResultadosOfAnalysis");
                                $("#resultsautobuild").html(`<font color='black'>Building ${CidadesDisp[ncidade].name}</font><br/>
${bdata.resourcesb.length} resources remaining<br/>
${CabinsToBuild} cabins to build<br/>
${(bdata.isbuilding.length+bdata.isbarracks.length)} buildings to build</br>
${Number(!bdata.wallbuilt)} wall to build<br/>
${bdata.istower.length} towers to build<br/>
<font color='green'>${bdata.cabinsbuilt.length} cabins built<br/>
${bdata.buildingsbuilt.length} buildings built<br/>
${Number(bdata.wallbuilt)} wall built<br/>
${bdata.towersbuilt.length} towers built<br/>
${Math.round(buildingscompleted)}% buildings level 10</font>`);
                                setTimeout(() => {
                                    if(cdata.cbt >= cdata.buto && bdata.buildingsbid[bdata.isbuilding[0]] == 467 && $("#ConfirmeCastleAutoB").is(":checked")) bdata.isbuilding.shift();
                                    if (bdata.resourcesb.length) $("#buildingDemolishButton").attr("s", bdata.resourcesb[0])[0].click();
                                    else if (bdata.isstorehouse.length) $("#buildingBuildButton").attr("t", bdata.buildingsbid[bdata.isstorehouse[0]]).attr("s", bdata.isstorehouse[0])[0].click();
                                    else if (bdata.iscabin.length) $("#buildingBuildButton").attr("t", 446).attr("s", bdata.iscabin[0])[0].click();
                                    else if (bdata.istower.length && !bdata.wallbuilt) {$("#buildingBuildButton").attr("t", bdata.buildingsbid[0]).attr("s", 0)[0].click();}
                                    else if (bdata.isbuilding.length && (bdata.buildingsbuilt.length+bdata.cabinsbuilt.length+bdata.bqueue.length) <= 100) {
                                        $("#buildingBuildButton").attr("t", bdata.buildingsbid[bdata.isbuilding[0]]).attr("s", bdata.isbuilding[0])[0].click();
                                        if (bdata.buildingsbid[bdata.isbuilding[0]] == 467) setTimeout(function(){$("#casConf")[0].click();NextCidade(true);},500);
                                    }
                                    else if (bdata.isbarracks.length && (bdata.buildingsbuilt.length+bdata.cabinsbuilt.length+bdata.bqueue.length) <= 100) $("#buildingBuildButton").attr("t", bdata.buildingsbid[bdata.isbarracks[0]]).attr("s", bdata.isbarracks[0])[0].click();
                                    else if ((bdata.isbuilding.length || bdata.isbarracks.length || bdata.cabinsbuilt.length) && buildingscompleted >= $("#StartDemoCabinsB").val()) $("#buildingDemolishButton").attr("s", bdata.cabinsbuilt[0])[0].click();
                                    else if (bdata.istower.length && bdata.wallbuilt) $("#buildingBuildButton").attr("t", bdata.buildingsbid[bdata.istower[0]]).attr("s", bdata.istower[0])[0].click();
                                    else if (bdata.buildingsbuilt.length >= 100) {
                                        $("#editspncn")[0].click();
                                        $("#citynotes").hide();
                                        fetch("includes/sNte.php", {method: "POST", headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                                                                    body: new URLSearchParams("?cid="+Number($("#cityDropdownMenu option:selected").val())+"&b=&a="+$("#CNremarks").val().replace(/(^|\s)[a-zA-Z]\d(\s|$)/g,""))
                                                                   });
                                        NextCidade(true);
                                    }
                                    else NextCidade(true);
                                }, initime+aleatorizarautob );
                            }
                        }
                        else NextCidade(true);
                    }
                    if(url.indexOf("fCv.php") != -1 && ContinuarAutoRaid) {
                        let TropasDisp = {Inf:0,Cav:0,Mys:0,Nav:0,Gal:0}, CargaDisp = {Normal:0,Gal:0}, MelhorCaverna = "", NumTropas, AvailDungeons = [], TropasToDungeon = [], TropasToGo = [], TsCasa;
                            for (let tropa in cotg.city.troops()) {
                                if(TropaTipo[(tropa.charAt(0).toUpperCase()+tropa.slice(1))]) {
                                    TropasDisp[TropaTipo[(tropa.charAt(0).toUpperCase()+tropa.slice(1))]] += cotg.city.troops()[tropa].home*TropaSpaceh[(tropa.charAt(0).toUpperCase()+tropa.slice(1))];
                                    if(cotg.city.troops()[tropa].home > 15) TropasToGo.push("#rval"+TropaType.indexOf((tropa.charAt(0).toUpperCase()+tropa.slice(1))));
                                    if(tropa != "galley") CargaDisp.Normal += cotg.city.troops()[tropa].home*TropaCarga[(tropa.charAt(0).toUpperCase()+tropa.slice(1))];
                                    else CargaDisp.Gal += cotg.city.troops()[tropa].home*TropaCarga[(tropa.charAt(0).toUpperCase()+tropa.slice(1))];
                                }
                            }
                        let GalleyOuNormal = (CargaDisp.Normal == 0 && CargaDisp.Gal > 0) ? CargaDisp.Gal : CargaDisp.Normal;
                        if($("#1BestOrCloser input[type=radio]")[0].checked) {
                            switch(Math.max(TropasDisp.Inf,TropasDisp.Cav,TropasDisp.Mys)) {
                                case 0: MelhorCaverna = ""; break;
                                case TropasDisp.Inf: MelhorCaverna = "Mountain"; break;
                                case TropasDisp.Cav: MelhorCaverna = "Forest"; break;
                                case TropasDisp.Mys: MelhorCaverna = "Hill"; break;
                                default: MelhorCaverna = "";
                            }
                        }
                        setTimeout(() => {
                            Object.values($("#dungloctab > tbody > tr.dunginf")).map(r => {return r.outerHTML;}).slice(0,-4).forEach(dungeon => {
                                NumTropas = GalleyOuNormal/RaidLoote[dungeon.split('lvl="')[1].split('"')[0]]/$("#1RaidCap").val()/(200-Number(dungeon.split('dtt="')[1].split("%")[0]))*10000;
                                if(dungeon.includes(MelhorCaverna) && Number(dungeon.split(" tile")[0].replace(/.*>/g,"")) < $("#1RaidDistance").val() && NumTropas >= 1 && !$("#incAttacksWindow").children().length && Number($("#wccommuse").text()) < Number($("#wccommtot").text()) && Number(dungeon.split('lvl="')[1].split('"')[0]) >= $("#1RaidLevel").val()) {
                                    AvailDungeons.push(dungeon.split('button id="')[1].split('"')[0]);
                                    TropasToDungeon.push(NumTropas);
                                }
                            });
                            if(AvailDungeons.length) {
                                $("#"+AvailDungeons[0])[0].click();
                                $("#WCcomcount").val(Math.min(Math.floor(TropasToDungeon[0]),(Number($("#wccommtot").text())-Number($("#wccommuse").text()))));
                                TropasToGo.forEach(tropaV => {
                                    TsCasa = (TropasToGo.length != 1 && tropaV == "#rval14") ? 0 : cotg.city.troops()[TropaType[Number(tropaV.match(/\d+/g))].toLowerCase()].home;
                                    ($("#1FillOrExact input[type=radio]")[0].checked) ? $(tropaV).val(Math.floor(TsCasa/TropasToDungeon[0])) : $(tropaV).val(Math.floor(TsCasa/Math.floor(TropasToDungeon[0])));
                                });
                                $("#raidaidGo")[0].click();
                                console.log($("#dungloctab > tbody > tr.dunginf"));
                            }
                            if(!RaidOnlyThis) setTimeout(() => NextRaid(true), 2000);
                            else {$("#warcouncbox").hide();ContinuarAutoRaid=false;RaidOnlyThis=false;}
                        }, 4000+Math.random()*DelayRaid);
                    }
                }
            }, false);
            open.apply(this, arguments);
        }
    })(XMLHttpRequest.prototype.open);

    function BoxBuild() {
        if($("#AutoBuildBox").length == 0) {
            $('body').append(`
<div id="AutoBuildBox" style="width:300px;height:560px;background-color:#E2CBAC;-moz-border-radius:10px;-webkit-border-radius:10px;border-radius:10px;border:4px ridge #DAA520;position:absolute;right:100px;top:100px;z-index:1000000;" class="ui-draggable">
<div class="popUpBar ui-draggable-handle" style="margin-top:0px;">
<span class="smallredheading" style="margin-left:10px;margin-top:10px;font-size:x-large;">Auto Builder</span>
<button id="councillorXbutton" class="xbutton" onclick="$('#AutoBuildBox').remove();ContinuarAutoBuilder=false;" style="margin-top:0px;margin-right:10px;"><div id="xbuttondiv"><div><div id="centxbuttondiv"></div></div></div></button></div>
<div id="returnbody" class="popUpWindow"><span class="tooltipstered">
<button class="greenb" id="OpenQuickSetupB" style="border-radius:6px;width:137px;">Quick Setup</button>
<button class="greenb" id="analisarcidadesB" style="border-radius:6px;width:137px;">Analyse</button>
<br/><br/><p id="ResultadosOfAnalysis" class="smallredheading">Analysing...</p><div id="AfterAnalysis" style="display:none";>
<table style="width:300px;"><tbody>
<tr><td style="white-space:nowrap;">Maximum number of cabins</td><td><input type="number" id="MaxCabinsToBuildB" value=${MaxCabinsAutoB} style="width:30px;"></td></tr>
<tr><td style="white-space:nowrap;">Start demolishing cabins after</td><td><input type="number" id="StartDemoCabinsB" value=${PercentageDemoCabins} style="width:30px;"><small>%</small></td></tr>
<tr><td colspan=2><input type="checkbox" style="vertical-align:middle;" id="BarracksPorUlt" name="BarracksPorUlt" ${BarracksAfterAll}><label for="BarracksPorUlt"> Barracks after all</label></td></tr>
<tr><td colspan=2><input type="checkbox" style="vertical-align:middle;" id="ConfirmeCastleAutoB" name="ConfirmeCastleAutoB" ${AutoBuildCastle}><label for="ConfirmeCastleAutoB"> Auto build castle (level 1)</label></td></tr>
<tr><td colspan=2><input type="checkbox" style="vertical-align:middle;" id="PauseToAvoidKicks" name="PauseToAvoidKicks" ${PauseAvoidKicks}><label for="PauseToAvoidKicks"> Pause to avoid disconnection</label></td></tr>
</tbody></table>
<button class="greenb" id="1KConstruct" style="border-radius:6px;width:137px;">Build</button>
<button class="greenb" id="1KNstop" style="border-radius:6px;width:137px;">Stop</button><br/><br/>
<button a="" id="ImaginaryButtonGOB" class="greenb chcity" style="display:none;"/>
</div>
<p id="resultsautobuild" class="smallredheading"></p></span></div></div>`);
            $("#AutoBuildBox").draggable({handle:".popUpBar",containment:"window",scroll: false}).resizable();
            $("#analisarcidadesB").click(() => {$("#ResultadosOfAnalysis").html("Analysing...");setTimeout(AnalisarCidades, 100);});
            $("#1KConstruct").click(() => {TempoDecorrido = new Date();NextCidade(false,true);ContinuarAutoBuilder=true; miniload(3000, "Going to the first city");});
            $("#1KNstop").click(() => {ContinuarAutoBuilder=false;setTimeout(FinishAutoBuilder,1000);});
            $("#OpenQuickSetupB").click(QuickSetupBox);
        }
        AnalisarCidades();
    }
    function SetupCity() {
        if($("#3WoodSetupMin").val()&&$("#3WoodSetupMax").val()&&$("#3StoneSetupMin").val()&&$("#3StoneSetupMax").val()&&$("#3IronSetupMin").val()&&$("#3IronSetupMax").val()&&$("#3FoodSetupMin").val()&&$("#3FoodSetupMax").val()&&$("#3CityCabinLv").val()&&$("#3CityFoodAlert").val()&&$("#3HubToReceive").val()&&$("#3HubToSend").val()) {
            let SetTr = {};
            Object.keys(TropaSpaceh).forEach(tropa => {SetTr[tropa] = $("#3"+tropa+"MaxVal").val() || 0;});
            let nome = $("#3CidadeName").val() || "*New City";
            let uparwall = ($("#3BuildWallsSetup").is(":checked")) ? 1 : 0;
            let upartowers = ($("#3BuildTowersSetup").is(":checked")) ? 1 : 0;
            let cid = Number($("#cityDropdownMenu option:selected").val());
            let a = `[1,1,1,1,1,1,1,1,0,${SetTr.Guard},${SetTr.Ballista},${SetTr.Ranger},${SetTr.Triari},${SetTr.Priestess},${SetTr.Vanquisher},${SetTr.Sorcerer},${SetTr.Scout},${SetTr.Arbalist},${SetTr.Praetor},${SetTr.Horseman},${SetTr.Druid},${SetTr.Ram},${SetTr.Scorpion},${SetTr.Galley},${SetTr.Stinger},${SetTr.Warship},${uparwall},${upartowers},"0","0","0","0",1,${$("#3WoodSetupMin").val()},${$("#3StoneSetupMin").val()},${$("#3IronSetupMin").val()},${$("#3FoodSetupMin").val()},"0","0","0","0",1,${$("#3HubToReceive").val()},${$("#3HubToSend").val()},0,"0","0",${$("#3WoodSetupMax").val()},${$("#3StoneSetupMax").val()},${$("#3IronSetupMax").val()},${$("#3FoodSetupMax").val()},[1,${Number($("#3CityCabinLv").val())}],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10],[1,10]]`;
            miniload(3000,"Configuring the city","#resultadosQuickSetup", true, 580);
            fetch("includes/mnio.php", {method:"POST",headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams("?a="+a+"&b="+cid)});
            setTimeout(() => {fetch("includes/nnch.php", {method:"POST",headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams("?a="+nome+"&cid="+cid)});},1000);
            setTimeout(() => {fetch("includes/sNte.php", {method:"POST",headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams("?cid="+cid+"&b=&a="+$('#3RemarksName').val())});},2000);
            setTimeout(() => {fetch("includes/svFW.php", {method:"POST",headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams("?cid="+cid+"&a="+Number($('#3CityFoodAlert').val()))});},3000);
            setTimeout(() => {$("#resultadosQuickSetup").html("<font color='green'>Successful configuration</font>");},4000);
        }
        else $("#resultadosQuickSetup").html("Configuration failed");
    }

    function QuickSetupBox() {
        if($("#AutoQuickSetupBox").length == 0) {
            let SelectCityChar = '<option value="">None</option>', HubList = '<option value="0">None</option>';
            CarregarPlanilha("https://docs.google.com/spreadsheets/d/e/2PACX-1vSRSsLYh9ddR-4Vra6F3m1tvTzTDWCnOy2qz9U5QZy1EbnZpb9XoyBw7b6sKjZ0uWeAr5VoqY5ntXwQ/pubhtml").then(data => {
                for(let CityDesign in data) {
                    SelectCityChar += '<option value="'+CityDesign+'">'+CityDesign+': '+data[CityDesign][1][22]+'</option>';
                }

                function ListaHub() {
                    let citylist=cotg.player.citylist(0), besthubs = {}, cid = Number($("#cityDropdownMenu option:selected").val()), HubList = '<option value="0">Off</option>';
                    for (let cityid in citylist) {
                        if(citylist[cityid].name.toLowerCase().includes('hub')) {
                            let distancia = Math.floor(Math.sqrt(Math.pow(((cid-cid%65536)/65536-(Number(cityid)-Number(cityid)%65536)/65536),2)+Math.pow((cid%65536-Number(cityid)%65536),2))*10000);
                            besthubs[distancia] = "<option value='"+cityid+"'>"+citylist[cityid].name+" ("+Math.round(distancia/1000)/10+")</option>";
                        }
                    }
                    Object.keys(besthubs).forEach(() => {
                        HubList += besthubs[Math.min(...Object.keys(besthubs))];
                        delete besthubs[Math.min(...Object.keys(besthubs))];
                    });
                    return HubList;
                }

                function RemarksValor(design = "") {
                    let cid = Number($("#cityDropdownMenu option:selected").val()), DesignsExistentes=[], designsMatch, DesNumbExist;
                    if(design != "") {
                        designsMatch = Object.keys(cotg.player.citylist(0)).map(id => {return cotg.player.citylist(0)[id].name}).toString().match(new RegExp("C"+Math.floor((cid-cid%65536)/6553600)+""+Math.floor(cid%65536/100)+" "+data[design][2][22]+" \\d+", "g"));
                        (designsMatch) ? (designsMatch.toString()+",").match(/\d+,/g).toString().replace(/,+/g," ").replace(/\s$/,"").split(" ").sort((a,b) => {return a-b}).forEach((d,n) => {if(Number(d) == (n+1)) DesignsExistentes.push(n);}) : DesignsExistentes=[];
                        return "C"+Math.floor((cid-cid%65536)/6553600)+""+Math.floor(cid%65536/100)+" "+data[design][2][22]+" "+(DesignsExistentes.length+1)+" "+design;
                    }
                    else {
                        $("#editspncn")[0].click();
                        $("#citynotes").hide();
                        designsMatch = Object.keys(cotg.player.citylist(0)).map(id => {return cotg.player.citylist(0)[id].name}).toString().match(new RegExp("C"+Math.floor((cid-cid%65536)/6553600)+""+Math.floor(cid%65536/100)+" "+$("#CNremarks").val().split(' ')[1]+" \\d+", "g"));
                        (designsMatch) ? (designsMatch.toString()+",").match(/\d+,/g).toString().replace(/,+/g," ").replace(/\s$/,"").split(" ").sort((a,b) => {return a-b}).forEach((d,n) => {if(Number(d) == (n+1)) DesignsExistentes.push(n);}) : DesignsExistentes=[];
                        DesNumbExist = ($("#CNremarks").val().split(" ")[3]) ? " "+$("#CNremarks").val().split(' ')[3] : "";
                        return "C"+Math.floor((cid-cid%65536)/6553600)+""+Math.floor(cid%65536/100)+" "+$("#CNremarks").val().split(' ')[1]+" "+(DesignsExistentes.length+1)+DesNumbExist;
                    }
                }

                function TropaTd(design = "") {
                    let TropaCity = [], divisorTropa, NumJaConfig;
                    if(design != "" && $("#3SetupTrp input[type=radio]")[0].checked) {
                        Object.keys(TropaSpaceh).forEach(tropa => {if(data[design][1][22].includes(tropa)) TropaCity.push(tropa);});
                        for (let TropaTd = 0; TropaTd < 4; TropaTd++) {
                            if(TropaCity[TropaTd]) {
                                let menosSenador = data[design][5][22].split(".").join("");
                                if(TropaCity.some(tropa => {return tropa=="Galley";})) {
                                    if(TropaCity[TropaTd] == "Galley") {divisorTropa = 6; menosSenador=0;}
                                    else divisorTropa = 6/5*(TropaCity.length-1);
                                }
                                else divisorTropa = TropaCity.length;
                                $("#3TropaSetup"+TropaTd).html(TropaCity[TropaTd]);
                                $("#3ITropaSetup"+TropaTd).html('<input type="number" id="3'+TropaCity[TropaTd]+'MaxVal" value="'+Math.floor((data[design][4][22].split(".").join("")/divisorTropa-menosSenador)/TropaSpaceh[TropaCity[TropaTd]])+'" style="width:80px;">');
                            }
                            else $("#3TropaSetup"+TropaTd+",#3ITropaSetup"+TropaTd).html("");
                        }
                    }
                    else {
                        $("#councillortbButton")[0].click();
                        $("#councillorPopUpBox").hide();
                        NumJaConfig = Object.values($("#councillorEnlistTable > table > tbody > tr input[type=number]")).map(v => {return (v.valueAsNumber > 0) ? v.valueAsNumber : undefined;});
                        Object.values($("#councillorEnlistTable > table > tbody > tr")).map(t => {return (t.innerText) ? t.innerText.replace(/\d+.*/g,"").replace(/\s*/g,"") : undefined;}).slice(0,-4).forEach((t,i) => {
                            if(NumJaConfig[i]) TropaCity.push('<input type="number" id="3'+t+'Val" value="'+NumJaConfig[i]+'" style="width:80px;">');
                        });
                        for (let TropaTd = 0; TropaTd < 4; TropaTd++) {
                            if(TropaCity[TropaTd]) {
                                $("#3TropaSetup"+TropaTd).html(TropaCity[TropaTd].split('id="3')[1].split("Max")[0]);
                                $("#3ITropaSetup"+TropaTd).html(TropaCity[TropaTd]);
                            }
                            else $("#3TropaSetup"+TropaTd+",#3ITropaSetup"+TropaTd).html("");
                        }
                    }
                }

               function ReservaMaterial(material, range = "#3PercMaxResMin") {
                   let matn, matt;
                   switch(material) {
                       case "wood":matn=6;matt="wood_st";break;
                       case "stone":matn=7;matt="stone_st";break;
                       case "iron":matn=8;matt="iron_st";break;
                       case "food":matn=9;matt="food_st";
                   }
                   if($("#3SetupNew").is(":checked") && $("#3CityCharFromSheet").val() != "") return Math.floor((data[$("#3CityCharFromSheet").val()][matn][22].split('.').join('')-1000)*$(range).val()/100000)*1000;
                   else return Math.floor((cotg.city.resources()[matt]-1000)*$(range).val()/100000)*1000;
               }
                $('body').append(`
<div id="AutoQuickSetupBox" style="width:600px;height:500px;background-color:#E2CBAC;-moz-border-radius:10px;-webkit-border-radius:10px;border-radius:10px;border:4px ridge #DAA520;position:absolute;right:200px;top:100px;z-index:1000000;" class="ui-draggable">
<div class="popUpBar ui-draggable-handle" style="margin-top:0px;">
<span class="smallredheading" style="margin-left:10px;margin-top:10px;font-size:x-large;">Quick Setup</span>
<span class="smallredheading" style="margin-top:10px;font-size:small;"><a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vSRSsLYh9ddR-4Vra6F3m1tvTzTDWCnOy2qz9U5QZy1EbnZpb9XoyBw7b6sKjZ0uWeAr5VoqY5ntXwQ/pubhtml" target="_blank">Designs sheet</a></span>
<button id="councillorXbutton" class="xbutton" onclick="$('#AutoQuickSetupBox').remove();" style="margin-top:0px;margin-right:10px;"><div id="xbuttondiv"><div><div id="centxbuttondiv"></div></div></div></button></div>
<div id="returnbody" class="popUpWindow"><span class="tooltipstered">
<table style="width:580px;"><tbody>
<tr><td>Design to use</td><td colspan=4><select id="3CityCharFromSheet" class="greensel" style="height:28px;border-radius:6px;">${SelectCityChar}</select></td></tr>
<tr><td>Name</td><td colspan=4><input type="text" id="3CidadeName" style="width:200px;" value="${DefaultNome}"></td></tr>
<tr><td>Remarks</td><td colspan=4><input type="text" id="3RemarksName" style="width:200px;" value="${RemarksValor()}"><button class="regButton greenb" id="3UpdateRemarks" style="border-radius:6px;margin-left:10px;height:22px;width:60px;">Update</button></td></tr>
<tr><td colspan=5><p id="3SetupOpc"><input type="radio" id="3SetupNew" name="3WhatToSetup" value=1 checked> Use future storage capacity <input type="radio" id="3SetupOld" name="3WhatToSetup" value=0> Use current storage capacity</p></td></tr>
<tr><td>Receive from</td><td>Wood</td><td>Stone</td><td>Iron</td><td>Food</td></tr>
<tr><td><select id="3HubToReceive" class="greensel" style="width:160px;height:28px;border-radius:6px;">${ListaHub()}</select></td>
<td><input type="number" id="3WoodSetupMin" style="width:80px;"></td><td><input type="number" id="3StoneSetupMin" style="width:80px;"></td>
<td><input type="number" id="3IronSetupMin" style="width:80px;"></td><td><input type="number" id="3FoodSetupMin" style="width:80px;"></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" id="3LinkHubs" name="3LinkHubs" checked><label for="3LinkHubs">&#128279</label></td>
<td colspan=2 rowspan=2><input type="checkbox" style="vertical-align:middle;" id="3LinkReceiveSend" name="3LinkReceiveSend" checked><label for="3LinkReceiveSend"> Same amounts</label></td>
<td colspan=2 rowspan=2 id="3PercMaxResMinTd"><input type="range" id="3PercMaxResMin" min=0 max=100 value=100></td></tr>
<tr><td>Send to</td>
<td colspan=2 style="display:none;" id="3PercMaxResMaxTd"><input type="range" id="3PercMaxResMax" min=0 max=100 value=100></td></tr>
<tr><td><select id="3HubToSend" class="greensel" style="width:160px;height:28px;border-radius:6px;" disabled=true>${ListaHub()}</select></td>
<td><input type="number" id="3WoodSetupMax" style="width:80px;" disabled=true></td><td><input type="number" id="3StoneSetupMax" style="width:80px;" disabled=true></td>
<td><input type="number" id="3IronSetupMax" style="width:80px;" disabled=true></td><td><input type="number" id="3FoodSetupMax" style="width:80px;" disabled=true></td></tr>
<tr><td>Troops</td><td id="3TropaSetup0"></td><td id="3TropaSetup1"></td><td id="3TropaSetup2"></td><td id="3TropaSetup3"></td></tr>
<tr><td><p id="3SetupTrp"><input type="radio" name="3TrNewExist" checked> Design <input type="radio" name="3TrNewExist"> Current</p></td><td id="3ITropaSetup0"></td><td id="3ITropaSetup1"></td><td id="3ITropaSetup2"></td><td id="3ITropaSetup3"></td></tr>
<tr><td>Configurations</td>
<td colspan=4>Cabins <select id="3CityCabinLv" class="greensel" style="height:20px;border-radius:6px;"><option value=1>1</option><option value=2>2</option><option value=3>3</option><option value=4>4</option><option value=5>5</option>
<option value=6>6</option><option value=7 selected>7</option><option value=8>8</option><option value=9>9</option><option value=10>10</option></select> Food Alert <select id="3CityFoodAlert" class="greensel" style="height:20px;border-radius:6px;">
<option value=1>1</option><option value=2>2</option><option value=3>3</option><option value=4>4</option><option value=5 selected>5</option><option value=6>6</option><option value=7>7</option><option value=8>8</option>
<option value=9>9</option><option value=10>10</option><option value=11>11</option><option value=12>12</option></select>
<input type="checkbox" style="vertical-align:middle;" id="3BuildWallsSetup" name="3BuildWallsSetup" checked><label for="3BuildWallsSetup"> Wall</label>
<input type="checkbox" style="vertical-align:middle;" id="3BuildTowersSetup" name="3BuildTowersSetup" checked><label for="3BuildTowersSetup"> Towers</label>
</td></tr><tbody></table>
<button class="greenb" id="3SetupDaCity" style="border-radius:6px;width:580px;margin-bottom:10px;margin-top:10px;">Setup</button>
<p id="resultadosQuickSetup" class="smallredheading"></p></span></div></div>`);
                $("#AutoQuickSetupBox").draggable({handle:".popUpBar",containment:"window",scroll: false}).resizable();
                $("#3SetupDaCity").click(SetupCity);
                function AttInputsQSetup(attall = true) {
                    $("#3WoodSetupMin,#3WoodSetupMax").val(ReservaMaterial("wood"));
                    $("#3StoneSetupMin,#3StoneSetupMax").val(ReservaMaterial("stone"));
                    $("#3IronSetupMin,#3IronSetupMax").val(ReservaMaterial("iron"));
                    $("#3FoodSetupMin,#3FoodSetupMax").val(ReservaMaterial("food"));
                    if(attall) {
                        $("#3RemarksName").val(RemarksValor($("#3CityCharFromSheet").val()));
                        TropaTd($("#3CityCharFromSheet").val());
                    }
                }
                AttInputsQSetup();
                $("#3SetupTrp input[type=radio]").change(() => {TropaTd($("#3CityCharFromSheet").val());});
                $("#3HubToReceive").focus(() => {$("#3HubToReceive").empty().append(ListaHub());});
                $("#3HubToSend").focus(() => {$("#3HubToSend").empty().append(ListaHub());});
                $("#3CityCharFromSheet").change(AttInputsQSetup);
                $("#3SetupOpc input[type=radio]").change(() => {AttInputsQSetup(false);});
                $("#3UpdateRemarks").click(() => {$("#3RemarksName").val(RemarksValor($("#3CityCharFromSheet").val()));});
                $("#3LinkReceiveSend").click(() => {
                    if($("#3LinkReceiveSend").is(":checked")) {
                        $("#3WoodSetupMax").prop("disabled",true).val($("#3WoodSetupMin").val());
                        $("#3StoneSetupMax").prop("disabled",true).val($("#3StoneSetupMin").val());
                        $("#3IronSetupMax").prop("disabled",true).val($("#3IronSetupMin").val());
                        $("#3FoodSetupMax").prop("disabled",true).val($("#3FoodSetupMin").val());
                        $("#3PercMaxResMaxTd").hide();
                        $("#3PercMaxResMinTd").prop("rowspan", 2);
                    }
                    else {
                        $("#3WoodSetupMax,#3StoneSetupMax,#3IronSetupMax,#3FoodSetupMax").prop("disabled", false);
                        $("#3PercMaxResMinTd").prop("rowspan", 1);
                        $("#3PercMaxResMaxTd").show();
                    }
                });
                $("#3LinkHubs").click(() => {($("#3LinkHubs").is(":checked")) ?  $("#3HubToSend").prop("disabled", true).val($("#3HubToReceive").val()) : $("#3HubToSend").prop("disabled", false);});
                $("#3HubToReceive").change(() => {if($("#3LinkHubs").is(":checked")) $("#3HubToSend").prop("disabled", true).val($("#3HubToReceive").val());});
                $("#3PercMaxResMin").change(() => {
                    if($("#3LinkReceiveSend").is(":checked")) {
                        AttInputsQSetup(false);
                        $("#3PercMaxResMax").val($("#3PercMaxResMin").val());
                    }
                    else {
                        $("#3WoodSetupMin").val(ReservaMaterial("wood"));
                        $("#3StoneSetupMin").val(ReservaMaterial("stone"));
                        $("#3IronSetupMin").val(ReservaMaterial("iron"));
                        $("#3FoodSetupMin").val(ReservaMaterial("food"));
                        $("#3WoodSetupMax").val(Math.max($("#3WoodSetupMax").val(),ReservaMaterial("wood")));
                        $("#3StoneSetupMax").val(Math.max($("#3StoneSetupMax").val(),ReservaMaterial("stone")));
                        $("#3IronSetupMax").val(Math.max($("#3IronSetupMax").val(),ReservaMaterial("iron")));
                        $("#3FoodSetupMax").val(Math.max($("#3FoodSetupMax").val(),ReservaMaterial("food")));
                    }
                });
                $("#3PercMaxResMax").change(function() {
                    $("#3WoodSetupMax").val(ReservaMaterial("wood", this));
                    $("#3StoneSetupMax").val(ReservaMaterial("stone", this));
                    $("#3IronSetupMax").val(ReservaMaterial("iron", this));
                    $("#3FoodSetupMax").val(ReservaMaterial("food", this));
                    $("#3WoodSetupMin").val(Math.min($("#3WoodSetupMin").val(),ReservaMaterial("wood", this)));
                    $("#3StoneSetupMin").val(Math.min($("#3StoneSetupMin").val(),ReservaMaterial("stone", this)));
                    $("#3IronSetupMin").val(Math.min($("#3IronSetupMin").val(),ReservaMaterial("iron", this)));
                    $("#3FoodSetupMin").val(Math.min($("#3FoodSetupMin").val(),ReservaMaterial("food", this)));
                });
            });
        }
    }

    function AutoReturn(retornar = true) {
        let RaidsToReturn = [], capacidadeCarga, existeTropa;
        fetch("overview/graid.php").then(response => response.json()).then(raids => {
            raids.a.forEach(city => {
                if(city[2].includes($("#4ContAutoK").val().split("C").join("C "))) {
                    city[12].forEach(raid => {
                        capacidadeCarga = 0; existeTropa = false;
                        raid[5].forEach(TrRaidando => {
                            capacidadeCarga += TropaCarga[TropaType[TrRaidando.tt]]*TrRaidando.tv;
                            if (Object.values($("#TAutoReturn > tr > td > input:checkbox").map((_,v) => {if(v.checked) return Number(v.value);})).slice(0,-3).includes(Number(TrRaidando.tt))) existeTropa = true;
                        });
                        if (($("#4ReturnCap").val()/100 > capacidadeCarga/RaidLoote[raid[2].match(/(?<=l\s).+?(?=\s\()/g)]/(2-raid[2].match(/(?<=\().+?(?=\%)/g)/100) || Math.sqrt(Math.pow(((raid[8]-raid[8]%65536)/65536-(city[0]-city[0]%65536)/65536),2)+Math.pow((raid[8]%65536-city[0]%65536),2)) > $("#4ReturnDistance").val() || $("#4ReturnLevel").val() > Number(raid[2].split("Level ")[1].split(" ")[0])) && existeTropa) RaidsToReturn.push(raid[0]);
                    });
                }
            });
            if(retornar) {
                if(RaidsToReturn.length) {
                    let AleatToReturn = Math.random()*300, bUrlUrO, cUrlUrO;
                    if ($("#4NowOrFutReturn input[type=radio]")[0].checked) {
                        bUrlUrO = 1;
                        cUrlUrO = 0;
                    }
                    else {
                        bUrlUrO = 3;
                        cUrlUrO = $("#4DataToReturn").val().split("-")[1]+"/"+$("#4DataToReturn").val().split("-")[2]+"/"+$("#4DataToReturn").val().split("-")[0]+" "+("0"+$("#4HourToReturn").val()).slice(-2)+":"+("0"+$("#4MinToReturn").val()).slice(-2)+":"+("0"+$("#4SecToReturn").val()).slice(-2);
                    }
                    miniload((200+AleatToReturn)*RaidsToReturn.length,"Returning troops","#resultadosAutoReturn", true);
                    RaidsToReturn.forEach((raid,n) => {
                        setTimeout(() => {fetch("includes/UrO.php", {method:"POST",headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams("?a="+raid+"&c="+cUrlUrO+"&b="+bUrlUrO)});},(100+AleatToReturn)*n);
                    });
                    setTimeout(() => {$("#resultadosAutoReturn").html("<font color='green'>"+RaidsToReturn.length+" raids are returning</font>");},((200+AleatToReturn)*RaidsToReturn.length+1000));
                }
                else $("#resultadosAutoReturn").html("No raid found");
            }
            else {
                (RaidsToReturn.length) ? $("#resultadosAutoReturnAnalyse").html("<font color='green'>"+RaidsToReturn.length+" raids ready to return</font>") : $("#resultadosAutoReturnAnalyse").html("No raid ready to return");
            }
        });
    }

    function BoxReturn() {
        $('body').append(`
<div id="AutoReturnBox" style="width:300px;height:500px;background-color:#E2CBAC;-moz-border-radius:10px;-webkit-border-radius:10px;border-radius:10px;border:4px ridge #DAA520;position:absolute;right:100px;top:100px;z-index:1000000;" class="ui-draggable">
<div class="popUpBar ui-draggable-handle" style="margin-top:0px;">
<span class="smallredheading" style="margin-left:10px;margin-top:10px;font-size:x-large;">Auto Return</span>
<button id="councillorXbutton" class="xbutton" onclick="$('#AutoReturnBox').remove();" style="margin-top:0px;margin-right:10px;"><div id="xbuttondiv"><div><div id="centxbuttondiv"></div></div></div></button></div>
<div id="returnbody" class="popUpWindow"><span class="tooltipstered">
<table style="width:300px;"><tbody id="TAutoReturn">
<tr><td>Carry Capacity < </td><td><input type="number" id="4ReturnCap" value=${AutoReturnCP} style="width:30px;"><small>%</small></td></tr>
<tr><td>Distance > </td><td><input type="number" id="4ReturnDistance" value=${AutoReturnDist} style="width:30px;"><small>Squares</small></td></tr>
<tr><td>Level < </td><td><input type="number" id="4ReturnLevel" value=${AutoReturnLvl} style="width:30px;"></td></tr>
<tr><td>Continent: </td><td><select id="4ContAutoK" class="greensel" style="height:28px;border-radius:6px;width:60px;"><option value="C">All</option><option value="C0">C00</option>
<option value="C01">C01</option><option value="C2">C02</option><option value="C3">C03</option><option value="C4">C04</option><option value="C5">C05</option>
<option value="C10">C10</option><option value="C11">C11</option><option value="C12">C12</option><option value="C13">C13</option><option value="C14">C14</option><option value="C15">C15</option>
<option value="C20">C20</option><option value="C21">C21</option><option value="C22">C22</option><option value="C23">C23</option><option value="C24">C24</option><option value="C25">C25</option>
<option value="C30">C30</option><option value="C31">C31</option><option value="C32">C32</option><option value="C33">C33</option><option value="C34">C34</option><option value="C35">C35</option>
<option value="C40">C40</option><option value="C41">C41</option><option value="C42">C42</option><option value="C43">C43</option><option value="C44">C44</option><option value="C45">C45</option>
<option value="C50">C50</option><option value="C51">C51</option><option value="C52">C52</option><option value="C53">C53</option><option value="C54">C54</option><option value="C55">C55</option></select></td></tr>
<p id="4Tropas" class="smallredheading" style="color:black;margin-top:5px;">
<tr><td><input type="checkbox" style="vertical-align:middle;" name="4ARv" value=5 checked><label for="4ARv">Vanquisher</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="4ARr" value=2 checked><label for="4ARr">Ranger</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="4ARt" value=3 checked><label for="4ARt">Triari</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="4ARd" value=11 checked><label for="4ARd">Druid</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="4ARh" value=10 checked><label for="4ARh">Horseman</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="4ARs" value=6 checked><label for="4ARs">Sorcerer</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="4ARa" value=8 checked><label for="4ARa">Arbalist</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="4ARw" value=16 checked><label for="4ARw">Warship</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="4ARst" value=15 checked><label for="4ARst">Stinger</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="4ARg" value=14 checked><label for="4ARg">Galley</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="4ARp" value=4 checked><label for="4ARp">Priestess</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="4ARpa" value=9 checked><label for="4ARpa">Praetor</label></td></tr>
<tr><td colspan=2><button class="greenb" id="4CAnalyseAll" style="border-radius:6px;margin-bottom:10px;width:278px;">Analyse</button></td></tr>
<tr><td colspan=2><p id="resultadosAutoReturnAnalyse" class="smallredheading">Analysing...</p></td></tr>
<tr><td colspan=2><p id="4NowOrFutReturn"><input type="radio" name="4AutoReturnNow" checked> Now <input type="radio" name="4AutoReturnNow">
<input type="number" id="4HourToReturn" value=00 style="width:20px" disabled>:<input type="number" id="4MinToReturn" value=00 style="width:20px" disabled>:<input type="number" id="4SecToReturn" value=00 style="width:20px" disabled>
<input type="date" id="4DataToReturn" style="width:120px" disabled></p></td></tr>
<tr><td colspan=2><button class="greenb" id="4CReturnAll" style="border-radius:6px;margin-bottom:10px;width:278px;">Return</button></td></tr></p></tbody></table>
<p id="resultadosAutoReturn" class="smallredheading"></p></span></div></div>');`);
        $("#AutoReturnBox").draggable({handle:".popUpBar",containment:"window",scroll: false}).resizable();
        $("#4CReturnAll").click(AutoReturn);
        $("#4CAnalyseAll").click(() => {$("#resultadosAutoReturnAnalyse").html("Analysing...");setTimeout(AutoReturn(false), 100);});
        $("#4NowOrFutReturn input[type=radio]").change(() => {
            if($("#4NowOrFutReturn input[type=radio]")[0].checked) $("#4HourToReturn,#4MinToReturn,#4SecToReturn,#4DataToReturn").prop("disabled",true);
            else {
                $("#4HourToReturn,#4MinToReturn,#4SecToReturn,#4DataToReturn").prop("disabled",false);
                $("#4HourToReturn").val(("0"+(Number($("#worldtime > span").text().split(":")[0])+5)).slice(-2));
                $("#4DataToReturn").val($("#worldtime").text().split(", ")[1]+"-"+("0"+("JanFebMarAprMayJunJulAugSepOctNovDec".indexOf($("#worldtime").text().match(/(?<=\s{3}).+?(?=\s)/g))/3+1)).slice(-2)+"-"+("0"+$("#worldtime").text().match(/(?<=\s{3}.{4}).+?(?=,)/g)).slice(-2));
            }
        });
        AutoReturn(false);
    }

    function StatusResPorHora() {
        const SIResPorHora = [" ", " k", " m", " b", " t", " p", " e"];
        let ResPorHoraCid,ResPorHora,TotalResPorHora=0,NumRaids=0,NumRaidsCid=0,ResVel;
        fetch("overview/graid.php").then(response => response.json()).then(raids => {
            raids.a.forEach(city => {
                ResPorHora=0;
                city[12].forEach(raid => {
                    ResVel=100;
                    raid[5].forEach(TrRaidando => {
                        if([2,3,4,5,6].includes(TrRaidando.tt)) ResVel = Math.min(ResVel,ResearchValores[cotg.player.research()[8]]);
                        else if([8,9,10,11].includes(TrRaidando.tt)) ResVel = Math.min(ResVel,ResearchValores[cotg.player.research()[9]]);
                        else if([14,15,16].includes(TrRaidando.tt)) ResVel = Math.min(ResVel,ResearchValores[cotg.player.research()[13]]);
                        ResPorHora += (1 > TropaCarga[TropaType[TrRaidando.tt]]*TrRaidando.tv/RaidLoote[raid[2].match(/(?<=l\s).+?(?=\s\()/g)]/(2-raid[2].match(/(?<=\().+?(?=\%)/g)/100)) ? TropaCarga[TropaType[TrRaidando.tt]]*TrRaidando.tv/(Math.sqrt(Math.pow(((raid[8]-raid[8]%65536)/65536-(city[0]-city[0]%65536)/65536),2)+Math.pow((raid[8]%65536-city[0]%65536),2))*VelTropas[TropaType[TrRaidando.tt]]/(1+ResVel/100)*2+120)*60 : RaidLoote[raid[2].match(/(?<=vel\s).+?(?=\s\()/g)]/(2-raid[2].match(/(?<=\().+?(?=\%)/g)/100)/(Math.sqrt(Math.pow(((raid[8]-raid[8]%65536)/65536-(city[0]-city[0]%65536)/65536),2)+Math.pow((raid[8]%65536-city[0]%65536),2))*VelTropas[TropaType[TrRaidando.tt]]/(1+ResVel/100)*2+120)*60;
                    });
                    NumRaids++;
                    if(Number($("#cityDropdownMenu option:selected").val()) == city[0]) NumRaidsCid++;
                });
                ResPorHoraCid = (Number($("#cityDropdownMenu option:selected").val()) == city[0]) ? ResPorHora.toFixed()+" R/h" : ResPorHoraCid;
                TotalResPorHora += (!isNaN(ResPorHora)) ? ResPorHora: 0;
            });
            let tierSI = Math.log10(TotalResPorHora) / 3 | 0;
            ResPorHora = (tierSI != 0) ? (TotalResPorHora/Math.pow(10,tierSI*3)).toFixed(2)+SIResPorHora[tierSI]+"R/h" : TotalResPorHora.toFixed(2)+" R/h";
            $("#InfoRaidPorHora").html("<p>Total = "+ResPorHora+" with "+NumRaids+" raids</p><p>Current City ("+$('#cityDropdownMenu option:selected').val()%65536+":"+(Number($('#cityDropdownMenu option:selected').val())-$('#cityDropdownMenu option:selected').val()%65536)/65536+") = "+ResPorHoraCid+" with "+NumRaidsCid+" raids</p>");
        });
    }

    function AnalisarRaid() {
        CidadesToRaid = [];
        fetch("includes/gIDl.php").then(response => response.json()).then(idles => {
            idles.forEach(cidade => {
                if(cidade.ts >= $("#1RaidTroops").val() && (Number($("#1ContAutoK").val().replace("C","")) == cidade.c.co || $("#1ContAutoK").val() == "C") && cidade.tr.some(t => Object.values($("#1CAnalyseAll > tr > td > input:checkbox").map((_,v) => {if(v.checked) return Number(v.value);})).slice(0,-3).includes(t))) CidadesToRaid.push(cidade.c.cid);
            });
            (CidadesToRaid.length) ? $("#resultadosAnaliseAutoRaid").html("<font color='green'>"+CidadesToRaid.length+" cities available to raid</font>") : $("#resultadosAnaliseAutoRaid").html("No cities available to raid");
            NumRaidsTo = CidadesToRaid.length;
        });
    }

    function NextRaid(shift = false) {
        let aleatGotoNext = Math.random()*DelayRaid;
        if(shift) CidadesToRaid.shift();
        $("#warcouncbox").hide();
        ReportBar((NumRaidsTo-CidadesToRaid.length),NumRaidsTo,CidadesToRaid.length+" cities to raid","#resultadosAnaliseAutoRaid");
        if(CidadesToRaid.length) {
            miniload(3000+aleatGotoNext, "Going to next city", "#resultadosAutoRaid", ContinuarAutoRaid);
            setTimeout(() => {
                $("#1ImaginaryButtonGOB").attr("a", CidadesToRaid[0])[0].click();
                setTimeout(() => {$("#loccavwarconGo")[0].click();}, 2000+aleatGotoNext);
            }, 2000+aleatGotoNext);
        }
        else {
            $("#resultadosAutoRaid").html("<font color='green'>Auto Raid Completed</font>");
            ContinuarAutoRaid=false;
        }
    }

    function BoxRaid() {
        $('body').append(`
<div id="AutoRaidBox" style="width:300px;height:560px;background-color:#E2CBAC;-moz-border-radius:10px;-webkit-border-radius:10px;border-radius:10px;border:4px ridge #DAA520;position:absolute;right:100px;top:100px;z-index:1000000;" class="ui-draggable">
<div class="popUpBar ui-draggable-handle" style="margin-top:0px;">
<span class="smallredheading" style="margin-left:10px;margin-top:10px;font-size:x-large;">Auto Raid</span>
<button id="councillorXbutton" class="xbutton" onclick="$('#AutoRaidBox').remove();ContinuarAutoRaid=false;" style="margin-top:0px;margin-right:10px;"><div id="xbuttondiv"><div><div id="centxbuttondiv"></div></div></div></button></div>
<div id="returnbody" class="popUpWindow"><span class="tooltipstered">
<table style="width:300px;"><tbody id="1CAnalyseAll">
<tr><td>Troops > </td><td><input type="number" id="1RaidTroops" value=${AutoRaidTroops} style="width:80px;"></td></tr>
<tr><td>Continent: </td><td><select id="1ContAutoK" class="greensel" style="height:28px;border-radius:6px;width:60px;"><option value="C">All</option><option value="C0">C00</option>
<option value="C01">C01</option><option value="C2">C02</option><option value="C3">C03</option><option value="C4">C04</option><option value="C5">C05</option>
<option value="C10">C10</option><option value="C11">C11</option><option value="C12">C12</option><option value="C13">C13</option><option value="C14">C14</option><option value="C15">C15</option>
<option value="C20">C20</option><option value="C21">C21</option><option value="C22">C22</option><option value="C23">C23</option><option value="C24">C24</option><option value="C25">C25</option>
<option value="C30">C30</option><option value="C31">C31</option><option value="C32">C32</option><option value="C33">C33</option><option value="C34">C34</option><option value="C35">C35</option>
<option value="C40">C40</option><option value="C41">C41</option><option value="C42">C42</option><option value="C43">C43</option><option value="C44">C44</option><option value="C45">C45</option>
<option value="C50">C50</option><option value="C51">C51</option><option value="C52">C52</option><option value="C53">C53</option><option value="C54">C54</option><option value="C55">C55</option></select></td></tr>
<p id="1Tropas" class="smallredheading" style="color:black;margin-top:5px;">
<tr><td><input type="checkbox" style="vertical-align:middle;" name="1ARv" value=5 checked><label for="1ARv">Vanquisher</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="1ARr" value=2 checked><label for="1ARr">Ranger</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="1ARt" value=3 checked><label for="1ARt">Triari</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="1ARd" value=11 checked><label for="1ARd">Druid</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="1ARh" value=10 checked><label for="1ARh">Horseman</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="1ARs" value=6 checked><label for="1ARs">Sorcerer</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="1ARa" value=8 checked><label for="1ARa">Arbalist</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="1ARw" value=16><label for="1ARw">Warship</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="1ARst" value=15><label for="1ARst">Stinger</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="1ARg" value=14><label for="1ARg">Galley</label></td></tr>
<tr><td><input type="checkbox" style="vertical-align:middle;" name="1ARp" value=4 checked><label for="1ARp">Priestess</label></td>
<td><input type="checkbox" style="vertical-align:middle;" name="1ARpa" value=9 checked><label for="1ARpa">Praetor</label></td></tr>
<tr><td colspan=2><button class="greenb" id="1CAnalyseAll" style="border-radius:6px;margin-bottom:10px;width:278px;">Analyse</button></td></tr></tbody></table>
<p id="resultadosAnaliseAutoRaid" class="smallredheading">Analysing...</p>
<table style="width:300px;"><tbody>
<tr><td>Carry Capacity: </td><td><input type="number" id="1RaidCap" value=${AutoRaidCP} style="width:30px;"><small>%</small><p id="1FillOrExact"><input type="radio" name="1ExactFill" checked> Exact <input type="radio" name="1ExactFill"> Fill</p></td></tr>
<tr><td>Distance < </td><td><input type="number" id="1RaidDistance" value=${AutoRaidDist} style="width:30px;"><small>Squares</small></td></tr>
<tr><td>Cavern to choose: </td><td><p id="1BestOrCloser"><input type="radio" name="1BestCloser" checked> Best <input type="radio" name="1BestCloser"> Closer</p></td></tr>
<tr><td>Level > </td><td><input type="number" id="1RaidLevel" value=${AutoRaidLvl} style="width:30px;"></td></tr>
<tr><td colspan=2><button class="greenb" id="1CRaidAll" style="border-radius:6px;margin-bottom:10px;width:90px;">Raid all</button>
<button class="greenb" id="1CRaidThis" style="border-radius:6px;margin-bottom:10px;width:90px;">Raid this</button>
<button class="greenb" id="1CStopRaidAll" style="border-radius:6px;margin-bottom:10px;width:90px;">Stop</button></td></tr></p></tbody></table>
<button a="" id="1ImaginaryButtonGOB" class="greenb chcity" style="display:none;"/>
<p id="resultadosAutoRaid" class="smallredheading"></p></span></div></div>`);
        $("#AutoRaidBox").draggable({handle:".popUpBar",containment:"window",scroll: false}).resizable();
        $("#1CAnalyseAll").click(AnalisarRaid);
        $("#1CRaidAll").click(() => {NextRaid();ContinuarAutoRaid=true;});
        $("#1CRaidThis").click(() => {RaidOnlyThis=true;ContinuarAutoRaid=true;$("#loccavwarconGo")[0].click();});
        $("#1CStopRaidAll").click(() => {ContinuarAutoRaid=false;});
        AnalisarRaid();
    }

    function kaliscript() {
        $('body').append(`
<div id="kaliscriptPopUpBox" class="popUpBox ui-draggable" style="left: 472px; z-index: 4000; display: block; width: 550px; right: auto; height: 633px; bottom: auto; top: 141px;">
<div class="ppbwinbgr"><div class="ppbwintop"></div><div class="ppbwincent"></div><div class="ppbwinbott"></div></div>
<div class="ppbwincontent"><div class="popUpBar ui-draggable-handle"><span class="ppspan">Kaliscript <small style="font-size:10px;">by kalish</small></span><div a="6" id="kalisgo" class="helpicon"></div>
<button id="councillorXbutton" class="xbutton" onclick="$('#kaliscriptPopUpBox').remove();"><div id="xbuttondiv"><div><div id="centxbuttondiv"></div></div></div></button></div><div class="popUpWindow">
<div id="councillordiv" class="beigetabspopup ui-tabs ui-widget ui-widget-content ui-corner-all">
<div id="kaliscriptB" class="scroll-pane ui-tabs-panel ui-widget-content ui-corner-bottom" aria-labelledby="ui-id-kali" role="tabpanel" aria-hidden="false" style="display: block;">
<div class="smallredheading" style="margin-left:30px;margin-top:20px;">Raiding</div>
<button id="OpenAutoRaidBox" style="right:66%;width:150px;height:30px;font-size:12px;position:absolute;" class="regButton greenb">Auto Raid</button>
<button id="OpenAutoReturnBox" style="right:36%;width:150px;height:30px;font-size:12px;position:absolute;" class="regButton greenb">Auto Return</button><br/>
<a id='InfoRaidPorHora' href='javascript;;' class='smallredheading' style='left:6%;margin-top:10px;width:300px;height:30px;font-size:10px;color:#990012;position:absolute;color:black;'>Click here to calculate R/H</a>
<div class="smallredheading" style="margin-left:30px;margin-top:50px;">Building</div>
<button id="OpenQuickSetupBox" style="right:36%;width:150px;height:30px;font-size:12px;position:absolute;" class="regButton greenb">Quick Setup</button>
<button id="OpenAutoBuildBox" style="right:66%;width:150px;height:30px;font-size:12px;position:absolute;" class="regButton greenb">Auto Builder</button>
</div></div></div>`);
        $("#kaliscriptPopUpBox").draggable({handle:".popUpBar",containment:"window",scroll: false}).resizable();
        $("#OpenAutoRaidBox").click(BoxRaid);
        $("#OpenQuickSetupBox").click(QuickSetupBox);
        $("#OpenAutoBuildBox").click(BoxBuild);
        $("#OpenAutoReturnBox").click(BoxReturn);
        $("#InfoRaidPorHora").click(e => {e.preventDefault();StatusResPorHora();});
       // StatusResPorHora();
    }
    $('#HelloWorld').hide();
    $("#councillordiv ul").eq(0).append("<li class='ui-state-default ui-corner-top' role='tab' tabindex='-1'><a href='javascript;;' class='ui-tabs-anchor' role='presentation' tabindex='-1' id='ui-id-kali'>Kaliscript</a></li>");
    $("#worldstatus").prepend("<a id='OpenKaliscript' class='smallredheading' href='javascript;;'>Kaliscript</a>&nbsp;&nbsp;");
    $("#OpenKaliscript").click(e => {e.preventDefault();kaliscript();});
    $("#ui-id-kali").click(e => {e.preventDefault();kaliscript();$("#councillorPopUpBox").hide();});
})();