// Game variables
let lives = 5;
let points = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lickedSafe = new Set();

// Element safety data based on real-world properties
const elementData = {
  1: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Hydrogen (H) is the star-fuel of the universe and powers rocket engines. Lick it? More like ignite your tongue!"
  },
  2: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Helium (He) keeps party balloons afloat and makes your voice squeaky. But licking this gas? It’ll slip away before you even try."
  },
  3: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Lithium (Li) charges your phone's battery. If you lick it, prepare for a mouthful of explosive chemistry—ouch!"
  },
  4: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Beryllium (Be) strengthens metal alloys in aerospace parts. Licking it might earn you a VIP trip to the hospital with lung issues."
  },
  5: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Boron (B) is used to make tough glass and detergents. Lick it and expect your taste buds to go on strike."
  },
  6: {
    safety: 'safe',
    message: "Carbon (C) is in everything from pencils to diamonds. Lick a pencil tip and you’ll be fine—just don’t try nibbling on diamonds!"
  },
  7: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Nitrogen (N) makes up most of the air, and is key in fertilizers. As a gas, it's basically un-lickable—your tongue won't even know it's there."
  },
  8: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Oxygen (O) keeps you alive with every breath. Licking pure oxygen? You’d just get a dry tongue and weird looks."
  },
  9: {
    safety: 'unsafe',
    livesLost: 3,
    message: "Fluorine (F) helps make Teflon and toothpaste. But licking this insanely reactive gas might leave you with a melted mouth."
  },
  10: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Neon (Ne) lights up those flashy signs. Licking it isn’t happening—try hugging light instead."
  },
  11: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Sodium (Na) flavors your fries as salt (with chlorine). Licking pure sodium is like tongue-wrestling fireworks."
  },
  12: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Magnesium (Mg) brightens fireworks and camera flashes. Licking it raw would create a brilliant flash in your mouth—no thanks!"
  },
  13: {
    safety: 'safe',
    message: "Aluminum (Al) wraps your leftovers and forms soda cans. Lick a clean piece of foil if you must, but watch out for fillings in your teeth!"
  },
  14: {
    safety: 'safe',
    message: "Silicon (Si) runs the tech world as computer chips. Licking a microchip won’t hurt you—just your device’s warranty."
  },
  15: {
    safety: 'unsafe',
    livesLost: 3,
    message: "Phosphorus (P) ignites match tips. Licking it directly is like tasting a spark of doom."
  },
  16: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Sulfur (S) is used in tires and smells like rotten eggs. Lick it and your breath might scare away the entire neighborhood."
  },
  17: {
    safety: 'unsafe',
    livesLost: 3,
    message: "Chlorine (Cl) purifies pools but can burn your lungs. Licking it in pure form is a surefire way to ruin your swim day."
  },
  18: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Argon (Ar) glows in neon lights and is an inert gas. Trying to lick it is like playing tongue-tag with thin air."
  },
  19: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Potassium (K) powers bananas (in compound form). Licking pure metal potassium is a quick ticket to an explosive reaction."
  },
  20: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Calcium (Ca) builds strong bones when in your diet. Pure calcium metal? Licking it is a recipe for a mouthful of sizzling regret."
  },
  21: {
    safety: 'safe',
    message: "Scandium (Sc) is a lightweight metal used in some sports equipment. Licking it is odd, but at least it's not dangerous."
  },
  22: {
    safety: 'safe',
    message: "Titanium (Ti) is used in implants and airplanes. You can lick it, but you’ll just taste an awkward metallic tang."
  },
  23: {
    safety: 'safe',
    message: "Vanadium (V) strengthens steel. If you’re keen on licking metal, this one won't do much harm—but it’s still weird."
  },
  24: {
    safety: 'safe',
    message: "Chromium (Cr) makes stainless steel shiny. Licking it is safe enough, but your reflection might stare back from the polished surface."
  },
  25: {
    safety: 'safe',
    message: "Manganese (Mn) is an alloy superhero and essential in tiny amounts. Licking the raw metal? Not deadly, just metallic."
  },
  26: {
    safety: 'safe',
    message: "Iron (Fe) is the backbone of your blood (as hemoglobin). Licking a chunk of iron is basically tasting a fence post."
  },
  27: {
    safety: 'safe',
    message: "Cobalt (Co) colors glass deep blue. Licking pure cobalt? Probably tastes like dusty metal and regret."
  },
  28: {
    safety: 'safe',
    message: "Nickel (Ni) forms coins and alloys. Licking a nickel coin is a tradition for bored kids—but watch out for germs."
  },
  29: {
    safety: 'safe',
    message: "Copper (Cu) runs in electrical wires and coins. Licking copper could give your tongue a tangy, mineral taste."
  },
  30: {
    safety: 'safe',
    message: "Zinc (Zn) helps your immune system. Licking a zinc supplement might be gross, but not deadly."
  },
  31: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Gallium (Ga) melts in your hand. Licking this shape-shifting metal could turn your mouth into a sci-fi scene."
  },
  32: {
    safety: 'safe',
    message: "Germanium (Ge) is used in semiconductors and optics. Licking it won't kill you, but you might just drool on your circuit board."
  },
  33: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Arsenic (As) is the classic poison. Licking it is basically an invitation to a toxic farewell party."
  },
  34: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Selenium (Se) is crucial in small doses for health, but pure selenium can be toxic. Licking it? Bad breath and worse outcomes."
  },
  35: {
    safety: 'unsafe',
    livesLost: 3,
    message: "Bromine (Br) is a corrosive liquid used in flame retardants. Lick it and your tongue might just dissolve. Hard pass."
  },
  36: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Krypton (Kr) lights up fluorescent lamps. Trying to lick this gas is like chasing a superhero you can’t catch."
  },
  37: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Rubidium (Rb) is used in some atomic clocks. Licking it is basically unleashing a mini explosion on your taste buds."
  },
  38: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Strontium (Sr) gives fireworks their red color. Licking it is like tasting the spark that launches the show."
  },
  39: {
    safety: 'safe',
    message: "Yttrium (Y) is used in LEDs and lasers. Licking it might earn you a blank stare—nothing dramatic happens."
  },
  40: {
    safety: 'safe',
    message: "Zirconium (Zr) is used in fake diamonds and nuclear reactors. Lick your cubic zirconia ring if you must—but it won't taste like wealth."
  },
  41: {
    safety: 'safe',
    message: "Niobium (Nb) strengthens steel and is used in superconductors. Licking it = basic metal taste, no superpowers."
  },
  42: {
    safety: 'safe',
    message: "Molybdenum (Mo) helps enzymes in your body. Licking the pure metal won't do much—just a mouthful of mild metallic flavor."
  },
  43: {
    safety: 'insta-kill',
    message: "Technetium (Tc) is radioactive and used in medical imaging. Lick it, and you might just glow from the inside—very briefly."
  },
  44: {
    safety: 'safe',
    message: "Ruthenium (Ru) is a rare metal used in electronics. Licking it is harmless, though your taste buds might disagree."
  },
  45: {
    safety: 'safe',
    message: "Rhodium (Rh) is a shiny, precious metal for jewelry. Licking it is no worse than tasting any other fancy metal."
  },
  46: {
    safety: 'safe',
    message: "Palladium (Pd) is used in catalytic converters. Tastes like mild metal, but your car relies on it for cleaner fumes."
  },
  47: {
    safety: 'safe',
    message: "Silver (Ag) is used in jewelry and utensils. People have literally eaten off silver for centuries—just maybe wash it first."
  },
  48: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Cadmium (Cd) is used in batteries and is pretty toxic. Licking it is a guaranteed way to upset your health department."
  },
  49: {
    safety: 'safe',
    message: "Indium (In) is a soft metal used in LCD screens. Licking it won’t kill you, but your TV might not appreciate it."
  },
  50: {
    safety: 'safe',
    message: "Tin (Sn) lines cans and helps form bronze. Licking it tastes like a bland can—at least it’s not poisonous."
  },
  51: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Antimony (Sb) is used in flame retardants. Licking it might set your tongue on a slow burn of toxicity."
  },
  52: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Tellurium (Te) can make you smell like garlic when ingested. Licking it might give you a stink that'll clear a room."
  },
  53: {
    safety: 'unsafe',
    livesLost: 3,
    message: "Iodine (I) is crucial for thyroid health in small doses. But pure iodine is harsh. Lick it, and your taste buds might stage a revolt."
  },
  54: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Xenon (Xe) is an inert gas used in flash lamps. Licking a flash of light? Good luck with that."
  },
  55: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Cesium (Cs) is used in atomic clocks. Licking it is like setting off a fireworks show in your mouth."
  },
  56: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Barium (Ba) helps doctors see your insides in X-rays (as a compound). Licking raw barium metal? Toxic meltdown."
  },
  57: {
    safety: 'safe',
    message: "Lanthanum (La) is a rare earth metal used in camera lenses. Licking it is unusual, but not particularly harmful."
  },
  58: {
    safety: 'safe',
    message: "Cerium (Ce) sparks in lighter flints. Licking it won't set you ablaze, but it's not exactly a recommended snack."
  },
  59: {
    safety: 'safe',
    message: "Praseodymium (Pr) tints glass and ceramics. Lick away if you're curious, but it’s more entertaining in glass form."
  },
  60: {
    safety: 'safe',
    message: "Neodymium (Nd) makes super-strong magnets. Licking a magnet might stick your tongue, but not deadly."
  },
  61: {
    safety: 'insta-kill',
    message: "Promethium (Pm) is radioactive and extremely rare. One lick and you're part of a tragic science experiment."
  },
  62: {
    safety: 'safe',
    message: "Samarium (Sm) is used in magnets and reactors. A harmless metal to lick, though it won’t impress anyone."
  },
  63: {
    safety: 'safe',
    message: "Europium (Eu) lights up your TV screens. Licking it is safe enough, but the show’s definitely not worth streaming."
  },
  64: {
    safety: 'safe',
    message: "Gadolinium (Gd) is used in MRI contrast agents. Licking the metal? Probably a pass, but it won't nuke your tongue."
  },
  65: {
    safety: 'safe',
    message: "Terbium (Tb) is another rare earth used in electronics. Perfectly boring to lick—no fireworks here."
  },
  66: {
    safety: 'safe',
    message: "Dysprosium (Dy) helps make lasers and magnets. Licking it won't make you magnetic, just awkward."
  },
  67: {
    safety: 'safe',
    message: "Holmium (Ho) is used in some lasers. It’s stable, so licking it is more confusing than dangerous."
  },
  68: {
    safety: 'safe',
    message: "Erbium (Er) tints sunglasses and is used in fiber optics. Licking it won't blind you—just tastes like metal."
  },
  69: {
    safety: 'safe',
    message: "Thulium (Tm) is rare and used in X-ray devices. Lick it if you love the taste of obscure metals, I guess."
  },
  70: {
    safety: 'safe',
    message: "Ytterbium (Yb) is used in alloys and lasers. Zero flavor adventure, but at least it’s not deadly."
  },
  71: {
    safety: 'safe',
    message: "Lutetium (Lu) is a pricey rare earth metal. Licking it is like tasting money you’ll never get back."
  },
  72: {
    safety: 'safe',
    message: "Hafnium (Hf) is used in nuclear reactors. Licking it probably won’t hurt you, but the reactor staff might frown."
  },
  73: {
    safety: 'safe',
    message: "Tantalum (Ta) is super corrosion-resistant and found in capacitors. Licking it is about as thrilling as licking a battery."
  },
  74: {
    safety: 'safe',
    message: "Tungsten (W) has the highest melting point, used in light bulb filaments. Licking a light bulb filament is a shocking idea—literally."
  },
  75: {
    safety: 'safe',
    message: "Rhenium (Re) is used in jet engine alloys. Licking it won't launch you into flight, just tastes like metal."
  },
  76: {
    safety: 'safe',
    message: "Osmium (Os) is the densest metal known. Lick it, and you’ll just have an extremely heavy piece of metal on your tongue."
  },
  77: {
    safety: 'safe',
    message: "Iridium (Ir) is corrosion-resistant and found in meteorites. Licking space metal might be cool, but it’s still just metal."
  },
  78: {
    safety: 'safe',
    message: "Platinum (Pt) is prized in jewelry and catalytic converters. Licking it won’t make you rich or drive you anywhere."
  },
  79: {
    safety: 'safe',
    message: "Gold (Au) is shiny, inert, and used in bling. Gold flakes on desserts are safe to eat—so go ahead and lick that fortune."
  },
  80: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Mercury (Hg) is a toxic, silvery liquid. Licking it would earn you a front-row seat to mercury poisoning."
  },
  81: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Thallium (Tl) is notorious for its toxicity. Lick it if you enjoy losing hair, health, and possibly your life."
  },
  82: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Lead (Pb) once used in pipes and paint, now known to be toxic. Licking it is like scheduling a doctor’s appointment."
  },
  83: {
    safety: 'safe',
    message: "Bismuth (Bi) soothes your tummy in Pepto-Bismol. Licking the pure metal is fairly harmless, but pink medicine tastes better."
  },
  84: {
    safety: 'insta-kill',
    message: "Polonium (Po) is radioactive and famously lethal. A single lick is basically a poison assassin's handshake."
  },
  85: {
    safety: 'insta-kill',
    message: "Astatine (At) is extremely rare and radioactive. One lick is a quick audition for a tragic sci-fi storyline."
  },
  86: {
    safety: 'insta-kill',
    message: "Radon (Rn) is a radioactive gas lurking in basements. Trying to lick a gas that can cause lung cancer? Hard pass."
  },
  87: {
    safety: 'unsafe',
    livesLost: 2,
    message: "Francium (Fr) is super rare and reactive. Licking it is like inviting a nuclear reaction onto your taste buds."
  },
  88: {
    safety: 'insta-kill',
    message: "Radium (Ra) used to be in glow-in-the-dark paints. Lick it and you might glow…for the rest of your short life."
  },
  89: {
    safety: 'insta-kill',
    message: "Actinium (Ac) is radioactive and rare. Licking it is basically signing up for a meltdown in your mouth."
  },
  90: {
    safety: 'insta-kill',
    message: "Thorium (Th) can power reactors. One lick could turn your future into a hazard zone."
  },
  91: {
    safety: 'insta-kill',
    message: "Protactinium (Pa) is incredibly radioactive. Licking it is like getting a backstage pass to radiation poisoning."
  },
  92: {
    safety: 'insta-kill',
    message: "Uranium (U) is fuel for nuclear power. Licking it is a fast track to a glowing obituary."
  },
  93: {
    safety: 'insta-kill',
    message: "Neptunium (Np) is radioactive and unnatural. Licking it invites cosmic-level complications."
  },
  94: {
    safety: 'insta-kill',
    message: "Plutonium (Pu) powers nuclear bombs. One lick is a surefire way to blow up your future."
  },
  95: {
    safety: 'insta-kill',
    message: "Americium (Am) is found in smoke detectors. Licking it is not the safety test you want to run."
  },
  96: {
    safety: 'insta-kill',
    message: "Curium (Cm) is radioactive and named for Marie Curie. She’d strongly advise you never to lick it."
  },
  97: {
    safety: 'insta-kill',
    message: "Berkelium (Bk) is radioactive. Licking it is an academic exercise in self-destruction."
  },
  98: {
    safety: 'insta-kill',
    message: "Californium (Cf) is used in nuclear research. A lick would be your final experiment."
  },
  99: {
    safety: 'insta-kill',
    message: "Einsteinium (Es) is radioactive. Einstein wouldn’t approve of you licking something so dangerous."
  },
  100: {
    safety: 'insta-kill',
    message: "Fermium (Fm) is synthetic and highly radioactive. Licking it is a eureka moment you’ll never live to share."
  },
  101: {
    safety: 'insta-kill',
    message: "Mendelevium (Md) honors Dmitri Mendeleev. He invented the periodic table, but never suggested licking this killer element."
  },
  102: {
    safety: 'insta-kill',
    message: "Nobelium (No) is radioactive. Alfred Nobel invented dynamite, but even that’s less dangerous than a lick of this."
  },
  103: {
    safety: 'insta-kill',
    message: "Lawrencium (Lr) is radioactive. A lick is a quick introduction to high-energy physics in the worst possible way."
  },
  104: {
    safety: 'safe',
    message: "Rutherfordium (Rf) is mostly theoretical in nature. Licking a theoretical element might be impossible—but safe in theory!"
  },
  105: {
    safety: 'safe',
    message: "Dubnium (Db) is synthetic and studied in labs. Licking it is more of a hypothetical—just don’t try it IRL."
  },
  106: {
    safety: 'safe',
    message: "Seaborgium (Sg) is named after Glenn Seaborg. Theoretically safe, but the real question is: where would you find any to lick?"
  },
  107: {
    safety: 'safe',
    message: "Bohrium (Bh) is a synthetic element. Again, good luck even finding it to lick—maybe a lab heist is in order?"
  },
  108: {
    safety: 'safe',
    message: "Hassium (Hs) is another lab-made element. You’d need a cutting-edge lab to taste-test this hypothetical metal."
  },
  109: {
    safety: 'safe',
    message: "Meitnerium (Mt) exists for mere moments in particle accelerators. Licking it is basically sci-fi fantasy."
  },
  110: {
    safety: 'safe',
    message: "Darmstadtium (Ds) was discovered in Germany. It decays almost instantly, so you couldn't lick it even if you tried."
  },
  111: {
    safety: 'safe',
    message: "Roentgenium (Rg) pays tribute to Wilhelm Röntgen (X-rays). Licking a ghost element is a real intangible experience."
  },
  112: {
    safety: 'safe',
    message: "Copernicium (Cn) honors Copernicus. If it existed in solid form long enough to lick, it might just vanish on your tongue."
  },
  113: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Nihonium (Nh) is extremely unstable. Lick it? It’d vanish faster than you can say ‘radioactive aftertaste.’"
  },
  114: {
    safety: 'safe',
    message: "Flerovium (Fl) is another super-heavy element. Theoretically stable, but practically impossible to find for a lick test."
  },
  115: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Moscovium (Mc) is highly unstable. Attempting to lick it is a no-go—goodbye, precious time and maybe your tongue."
  },
  116: {
    safety: 'safe',
    message: "Livermorium (Lv) is named for Livermore, California. Stable ‘in theory,’ but blink and it’s gone—no time to taste."
  },
  117: {
    safety: 'unsafe',
    livesLost: 3,
    message: "Tennessine (Ts) is super heavy and reactive. Licking it is like chasing a ghost that’s out to get you."
  },
  118: {
    safety: 'unsafe',
    livesLost: 1,
    message: "Oganesson (Og) is a fleeting gas. If you tried to lick it, you’d find it's gone before your taste buds even register."
  }
}
;

// Calculate total safe elements
function calculateTotalSafe() {
    let count = 0;
    for (let i = 1; i <= 118; i++) {
        if (elementData[i] && elementData[i].safety === 'safe') count++;
    }
    return count;
}
const totalSafe = calculateTotalSafe();

// Update status display
function updateStatus() {
    document.getElementById('lives').textContent = lives;
    document.getElementById('points').textContent = points;
    document.getElementById('highScore').textContent = highScore;
}

// Reset game
function resetGame() {
    lives = 5;
    points = 0;
    lickedSafe.clear();
    document.querySelectorAll('.element').forEach(cell => {
        cell.classList.remove('licked-safe', 'licked-unsafe', 'licked-insta-kill');
        const livesLost = cell.querySelector('.lives-lost');
        if (livesLost) livesLost.remove();
    });
    updateStatus();
    alert('Game restarted! Click an element to begin.');
}

// Handle element click
function handleClick(event) {
    const cell = event.target.closest('td.element');
    if (!cell) return;
    const atomicNumber = parseInt(cell.querySelector('.number').textContent);
    if (lickedSafe.has(atomicNumber)) {
        alert('You already licked this element!');
        return;
    }
    const data = elementData[atomicNumber];

    if (data.safety === 'safe') {
        cell.classList.add('licked-safe');
        points++;
        lickedSafe.add(atomicNumber);
        updateStatus();
        alert('It’s okay to lick!\n' + data.message);
        if (lickedSafe.size === totalSafe) {
            alert(`Congratulations! You licked all ${totalSafe} safe elements and won! Final Score: ${points}`);
            if (points > highScore) {
                highScore = points;
                localStorage.setItem('highScore', highScore);
                updateStatus();
            }
            resetGame();
        }
    } else if (data.safety === 'unsafe') {
        cell.classList.add('licked-unsafe');
        lives -= data.livesLost;
        const livesLostText = document.createElement('span');
        livesLostText.className = 'lives-lost';
        livesLostText.textContent = `-${data.livesLost}`;
        cell.appendChild(livesLostText);
        updateStatus();
        alert('Not safe to lick!\n' + data.message);
        if (lives <= 0) {
            alert(`Game Over! You lost all lives. Final Score: ${points}`);
            if (points > highScore) {
                highScore = points;
                localStorage.setItem('highScore', highScore);
                updateStatus();
            }
            resetGame();
        }
    } else if (data.safety === 'insta-kill') {
        cell.classList.add('licked-insta-kill');
        lives = 0;
        const livesLostText = document.createElement('span');
        livesLostText.className = 'lives-lost';
        livesLostText.textContent = 'Insta-kill';
        cell.appendChild(livesLostText);
        updateStatus();
        alert('INSTA KILL\nNot safe to lick!\n' + data.message);
        alert(`Game Over! You licked a deadly element. Final Score: ${points}`);
        if (points > highScore) {
            highScore = points;
            localStorage.setItem('highScore', highScore);
            updateStatus();
        }
        resetGame();
    }
}

// Add event listeners
document.querySelectorAll('.element').forEach(cell => {
    cell.addEventListener('click', handleClick);
});

// Initial update
updateStatus();