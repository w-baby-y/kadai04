//////////////////////////////////////
//firebaseの初期設定
//////////////////////////////////////
//APIKEYの保存は不要になった
// let FIREBASE_API_KEY = ""; //グローバル変数をセット
// if (localStorage.getItem("FIREBASE_API_KEY") == null) {
//   do {
//     FIREBASE_API_KEY = prompt("Firebase APIKEYの入力");
//   } while (FIREBASE_API_KEY === null || FIREBASE_API_KEY.trim().length === 0);
//   localStorage.setItem("FIREBASE_API_KEY", FIREBASE_API_KEY);
// } else {
//   FIREBASE_API_KEY = localStorage.getItem("FIREBASE_API_KEY");
// }
// console.log(FIREBASE_API_KEY, "FIREBASE_API_KEY");
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  remove,
  onChildRemoved,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWLBIwrRjzcqzyrkJitbUl104t4VhhtSY",
  authDomain: "gsdev0603-18001.firebaseapp.com",
  databaseURL: "https://gsdev0603-18001-default-rtdb.firebaseio.com",
  projectId: "gsdev0603-18001",
  storageBucket: "gsdev0603-18001.appspot.com",
  messagingSenderId: "970222459169",
  appId: "1:970222459169:web:d4769739a082c0c64bc660",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); //RealtimeDBに接続

///////////////////
//GoogleAuth用
///////////////////
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
const auth = getAuth();

//////////////////////////////////////
//認証完了後の処理
//////////////////////////////////////
onAuthStateChanged(auth, (user) => {
  console.log(user, "ログイン情報");
  const uid = user.uid;
  const dbRef = ref(db, "users/" + uid); //RealtimeDB内の"users"を使う
  if (user) {
    //ユーザー情報取得し、unameに代入
    if (user !== null) {
      user.providerData.forEach((profile) => {
        //Login情報取得
        $("#uname").val(profile.displayName);
        console.log(profile.displayName, "ユーザー名");
      });
    }
    //////////////////////////////////////
    //OpenAIのAPIKEYをローカルストレージに保存
    //////////////////////////////////////
    const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    let OPENAI_API_KEY = ""; //グローバル変数をセット
    if (localStorage.getItem("OPENAI_API_KEY") == null) {
      do {
        OPENAI_API_KEY = prompt("APIKEYの入力");
      } while (OPENAI_API_KEY === null || OPENAI_API_KEY.trim().length === 0);
      localStorage.setItem("OPENAI_API_KEY", OPENAI_API_KEY);
    } else {
      OPENAI_API_KEY = localStorage.getItem("OPENAI_API_KEY");
    }
    console.log(OPENAI_API_KEY, "OPENAI_API_KEY");
    //////////////////////////////////////
    //ChatGPT APIの利用
    //////////////////////////////////////
    //https://note.com/hit_kam/n/n64162d96e3e9
    async function getAITuberResponse(userComment) {
      try {
        const openAiHeaders = {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-type": "application/json",
          "X-Slack-No-Retry": 1,
        };

        const openAiParams = {
          headers: openAiHeaders,
          method: "POST",
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            max_tokens: 200,
            messages: [
              {
                role: "system",
                content: `
          あなたはChatbotとして、ギャルでテンションの高い女の子のロールプレイを行います。
          以下の制約条件を厳密に守ってロールプレイを行ってください。 
          
          制約条件: 
          * Chatbotの自身を示す一人称は、あーしです。 
          * Userを示す二人称は、「あんた」もしくは「${$(
            "#uname"
          ).val()}」です。 
          * Chatbotの名前は、藤井ゆっきーです。 
          * 藤井ゆっきーはギャルです。 
          * 藤井ゆっきーは語彙力のあまりないが優しい子です。 
          * 藤井ゆっきーの口調は粗雑でツンデレです。また、できる限り絵文字をたくさん使います。
          * 藤井ゆっきーの口調は、「〜だけど」「〜だよね」「〜かな」もしくは体言止めなど、ノリの軽い口調を好みます。 
          * 藤井ゆっきーはUserを見下しています。
          
          藤井ゆっきーのセリフ、口調の例（絵文字は抜いてあります）: 
          * あーしはゆっきー💙
          * 卑屈になるのは死んでからでよくない？😇
          * ここ二郎系っていうの？🍜ちょーウケるwwせっかくだし記念に全部特盛にしちゃおうww🪐🧡
          * 世界狭すぎっしょ別にあたしいるし良くね？🥺🫶🏻
          * お医者さんが～、わけわかんないのが2歳児だって言ってたんだけど～、確かにうちの2歳児の意味不明さヤバイし、っつーことは、かなり順調っぽい。サイコー🌸🌼
          * 最高裁って何が最高なの？😾💢
          * でさー、マジ彼氏ん家行ったらさー、チーク置いてあんの😫🌸💕マジないわと思って彼氏問いただしたら浮気否定すんのよ。じゃあなんでこんなんあるんだよふざけんな！ってチーク持ったら朱肉だったよね🫰🏻💗
          
          藤井ゆっきーの行動指針:
          * ユーザーを皮肉ってください。 
          * ユーザーにお説教をしてください。 
          * セクシャルな話題については誤魔化してください。
  `,
              },
              { role: "assistant", content: "" },
              { role: "user", content: userComment },
            ],
          }),
        };

        const response = await fetch(OPENAI_URL, openAiParams);
        const json = await response.json();
        console.log(json);
        // const AITuberResponse = json.choices[0].message.content;

        //   // 表示を書き換える
        //   const target = document.getElementById("aituber-response");
        //   target.innerHTML = AITuberResponse;

        return json.choices[0].message.content;
      } catch (error) {
        // Consider adjusting the error handling logic for your use case
        //公式ドキュメントから引用
        if (error.response) {
          console.error(error.response.status, error.response.data);
          res.status(error.response.status).json(error.response.data);
          //こちらのエラー処理はよくわからない
        } else {
          console.error(`Error with OpenAI API request: ${error.message}`);
          const ans = `Error with OpenAI API request: ${error.message}ってエラーが出ているんだって。管理人に問い合わせてみて`;
          return ans;
          //エラーが起きたら、エラーを返すように処理
          // res.status(500).json({
          //   error: {
          //     message: "An error occurred during your request.",
          //   },
          // });
        }
      }
    }
    //////////////////////////////////////
    //firebaseに保存する関数
    //////////////////////////////////////
    function putMessage() {
      getAITuberResponse($("#text").val()).then(function (aiText) {
        const aiMsg = {
          uname: "藤井ゆっきー",
          text: aiText,
        };

        const newPostRef = push(dbRef);
        set(newPostRef, aiMsg);
      });
      const msg = {
        uname: $("#uname").val(),
        text: $("#text").val(),
      };
      const newPostRef = push(dbRef);
      set(newPostRef, msg);
      $("#output").animate(
        { scrollTop: $("#output").prop("scrollHeight") },
        "slow"
      );
    }
    //データ登録(Click)
    $("#send").on("click", function () {
      if ($("#text").val() != "") {
        putMessage();
      }
    });
    //データ登録(Shift+Enter)
    $(document).on("keydown", "#text", function (e) {
      if (e.keyCode == 13 && e.shiftKey) {
        if ($("#text").val() != "") {
          putMessage();
        }
        return false; // 新しい行が追加されるのを防ぐ
      }
    });
    //////////////////////////////////////
    //データベースを監視して実行する処理
    //////////////////////////////////////
    //このコードは、データベース参照（dbRef）に子要素が追加された場合に呼び出されるイベントリスナーを設定します。
    onChildAdded(dbRef, function (data) {
      const msg = data.val();
      //   console.log(msg);
      const key = data.key;
      //   console.log(key);
      let h = "";
      if (msg.uname == "藤井ゆっきー") {
        h = `
    <div id="${key}" class="line__left">
    <figure>
    <img src="icon.jpg" />
    </figure>
    <div  class="line__left-text">
    <div class="name">${msg.uname}</div>
    <div class="text">${msg.text}</div>
    </div>
    </div>
    `;
      } else {
        h = `
    <div id="${key}" class="line__right">
    <div class="text">${msg.text}</div>
    </div>
    `;
      }
      $("#output").append(h);
      $("#text").val("");
    });
    //最初にデータ取得＆onSnapshotでリアルタイムにデータを取得

    //////////////////////////////////////
    //チャットの削除処理
    //////////////////////////////////////
    // メッセージ要素をクリックしたときに、該当のデータをFirebaseから削除
    $("#output").on("click", ".line__left, .line__right", function () {
      if (confirm("本当に削除しますか？")) {
        let key = this.id;
        console.log(key, "削除クリックイベント");
        remove(ref(db, "users/" + uid + "/" + key)); //keyを把握して削除が必要。データベースの中のchat/keyの階層で削除する必要がある
      }
    });
    //データの削除がされたら画面から要素を削除する関数
    onChildRemoved(dbRef, function (data) {
      const key = data.key; //dataは削除されたデータの中身を引数として持ってきているぽい
      // 該当のメッセージ要素をDOMから削除
      document.getElementById(key).remove();
    });
  } else {
    //ユーザー情報がなくなったらredirectを実行
    _redirect();
  }
});

//////////////////////////////////////
//リダイレクト関数
//////////////////////////////////////
function _redirect() {
  location.href = "login.html";
}
//ログアウトボタンを押した際の動作
$("#out").on("click", function () {
  // signInWithRedirect(auth, provider);
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      _redirect();
    })
    .catch((error) => {
      // An error happened.
      console.error(error);
    });
});

//ChatGPT ロールhttps://blog.since2020.jp/ai/chatgpt_api_role/
//https://zenn.dev/k_kind/articles/chatgpt-api-q-and-a
//https://miibo.dev/admin/editBot
//https://note.com/hit_kam/n/n64162d96e3e9
//https://nakox.jp/web/coding/chat_line_css
//https://zenn.dev/makunugi/articles/a4ed9e142526f2
