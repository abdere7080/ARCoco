// game.js
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");
const playerNumber = urlParams.get("p"); // "1" أو "2"

const db = firebase.database().ref("rooms/" + roomId);
let playerName = null;
let opponentName = null;

// دالة اختيار العنصر
function choose(element) {
  db.child("players/p" + playerNumber).update({ choice: element });
  document.getElementById("status").innerText = "تم اختيارك: " + element + ". انتظر الخصم...";
}

// تحميل بيانات الغرفة وتحديث النقاط
db.on("value", snapshot => {
  const data = snapshot.val();
  if (!data) return;

  const p1 = data.players.p1;
  const p2 = data.players.p2;

  if (playerNumber === "1") {
    playerName = p1.name;
    opponentName = p2.name;
  } else {
    playerName = p2.name;
    opponentName = p1.name;
  }

  // عندما يدخل اللاعب الثاني
  if (p1.name && p2.name && !opponentName) {
    opponentName = playerNumber === "1" ? p2.name : p1.name;
  }

  // إذا اختار كل لاعب
  if (p1.choice && p2.choice) {
    const winner = getWinner(p1.choice, p2.choice);
    if (winner === "p1") db.child("players/p1/score").set(p1.score + 1);
    else if (winner === "p2") db.child("players/p2/score").set(p2.score + 1);

    alert("نتيجة الجولة:\n" +
      p1.name + " اختار " + p1.choice + "\n" +
      p2.name + " اختار " + p2.choice + "\n" +
      (winner === "draw" ? "تعادل!" : winner === "p1" ? p1.name + " فاز!" : p2.name + " فاز!"));

    // إعادة الاختيارات للجولة التالية
    db.child("players/p1").update({ choice: null });
    db.child("players/p2").update({ choice: null });
  }
});

// دالة تحديد الفائز بين العناصر الخمسة
function getWinner(a, b) {
  if (a === b) return "draw";

  const rules = {
    fire: ["plant"], // النار تهزم النبات
    water: ["fire"], // الماء تهزم النار
    earth: ["water"], // التراب يهزم الماء
    wind: ["earth"], // الريح تهزم التراب
    plant: ["wind"]  // النبات يهزم الريح
  };

  if (rules[a] && rules[a].includes(b)) return playerNumber === "1" ? "p1" : "p2";
  return playerNumber === "1" ? "p2" : "p1";
}
