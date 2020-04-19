'use strict';

const dominantGenes = [
    "acid","adder","ahi","ajax","ambush","arcane","arroyo","asphalt","bald","bamboo",
    "banana","black","black head","black pastel","blade","bling yellow belly","blitz",
    "bongo","brite","butter","calico","carbon","champagne","chocolate","cinder","cinnamon",
    "citrus pastel","coffee","confusion","congo","coral glow","cypress","desert","disco",
    "ember","enchi","fire","flame","flare","fusion","garcia","genetic banded",
    "genetic black back","genex","ghi","goblin","gold blush","granite","gravel","grim",
    "harlequin","het daddy","het red axanthic","hidden gene woma","hieroglyphic","honey",
    "huffman","hurricane","hydra","joppa","josie","jungle woma","krg","lace","lace black back",
    "lemon pastel","lemonback","leopard","lesser","lori","lucifer","mahogany","malum","mario",
    "marvel","mckenzie","melt","microscale","mocha","mojave","mota","motley","mystic","nanny",
    "nova","nr mandarin","odium","orange belly","orange dream","oriole","pastel","phantom",
    "phenomenon","pinstripe","quake","rar","raven","razor","red gene","red stripe","redhead",
    "russo","sable","sandblast","sapphire","satin","sauce","scaleless head","shatter","shrapnel",
    "shredder","smuggler","spark","special","specter","spider","splatter","spotnose","static",
    "stranger","sugar","sulfur","surge","toxique","trick","trojan","vanilla","vesper","web",
    "woma","wookie","x-treme gene","x-tremist","yellow belly"
]

const recessiveGenes = [
    "albino","axanthic (jolliff)","axanthic (mj)","axanthic (tsk)","axanthic (vpi)","bengal",
    "black axanthic","black lace","candy","caramel albino","citrus hypo","clown","desert ghost",
    "enhancer","genetic stripe","ghost","ghost (vesper)","lavender albino","migraine","monarch",
    "monsoon","orange crush","orange ghost","paint","piebald","puzzle","rainbow","sahara","sentinel",
    "sunset","toffee","tri-stripe","ultramel","whitewash"
]

function getDominantGenes() {
    return dominantGenes;
}

function getRecessiveGenes() {
    return recessiveGenes;
}

const aliases = [
    {"name": "piebald", "alias": "pied"},
    {"name": "lavender albino", "alias": "lavender"}
]

const allelic = [
    {"name": "candino", "combo": ["candy", "albino"]}
]

function getBrowserVars() {
    const parameters = {};
    const pattern = /[?&]+([^=&]+)=([^&]*)/gi;

    var params = decodeURI(window.location.href).replace(pattern, (match, key, value) => {
        parameters[key.toLowerCase()] = value.replace();
    });

    return parameters;
}

function traitCombinations(arr, supers=[], visuals=[]) {
  var result = [];
  var f = function(prev, arr) {
    for (var i = 0; i < arr.length; i++) {
      for (let s = 0; s < supers.length; s++) {
        if(!prev.includes(supers[s])) {
            prev.push(supers[s]);
        }
      }

      for (let v = 0; v < visuals.length; v++) {
        if(!prev.includes(visuals[v])) {
            prev.push(visuals[v]);
        }
      }

      result.push(prev.concat(arr[i]).sort());
      f(prev.concat(arr[i]), arr.slice(i + 1));
    }
  }
  f([], arr);
  return result;
}

function pair(male, female) {
    var alltraits = male.traits.slice().concat(female.traits)
                .filter(item => !(item.toLowerCase().startsWith('super ') || recessiveGenes.includes(item.toLowerCase())))
                .map(val => val.toLowerCase());
    var supers = male.traits.slice().concat(female.traits)
                .filter(item => item.toLowerCase().startsWith('super ')).map(superstr => superstr.substring(6))
                .map(val => val.toLowerCase());
    var visuals = male.traits.slice().concat(female.traits)
                .filter(item => recessiveGenes.includes(item.toLowerCase()))
                .map(val => val.toLowerCase());

    var traitCombos = traitCombinations(alltraits, supers, visuals);
              
    if(supers.length || visuals.length) {
        traitCombos.push([supers, visuals].flat());
    }

    var normalChance = (supers.length > 0 || visuals.length > 0) ? 0 : 1;
    var percent = 100 / (traitCombos.length + normalChance);

    var formattedgenes = traitCombos.map(combo => {
        let homogenes = combo.filter(val => combo.indexOf(val) !== combo.lastIndexOf(val));
        let heterogenes = combo.filter(val => combo.indexOf(val) === combo.lastIndexOf(val));

        homogenes = homogenes.filter((val, vi) => vi === homogenes.lastIndexOf(val))
                    .map((val, vi) => recessiveGenes.includes(val) ? val + " (visual)" : "super " + val)
                    

        heterogenes = heterogenes.filter((val, vi) => vi === heterogenes.lastIndexOf(val))
                      .map((val, vi) => recessiveGenes.includes(val) ? val + " (het)" : val)
                      
        return homogenes.concat(heterogenes);
    });

    console.log(formattedgenes);

    const calculated = [];

    for(var combo in formattedgenes) {
        let hets = formattedgenes[combo].filter(val => val.includes('(het)'));
        let visuals = formattedgenes[combo].filter(val => !val.includes('(het)'));
        let textCombo = visuals.concat(hets).join(', ');

        console.log(textCombo);

        if(textCombo in calculated) {
            calculated[textCombo].percent += percent;
        } else {
            calculated[textCombo] = { 'traits': traitCombos[combo], 'percent': percent };
        }
    }

    var visualpct = Object.keys(calculated).reduce((acc, combo) => acc + calculated[combo].percent, 0);

    if(visualpct < 100) {
        calculated["normal"] = { "traits": [], "percent": 100 - visualpct};
    }

    return calculated;
}

module.exports = { pair, getDominantGenes, getRecessiveGenes };