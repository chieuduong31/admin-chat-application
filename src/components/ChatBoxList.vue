<template>
  <div class="d-flex bg-theme-color justify-content-center align-items-center vh-100 p-5">
    <div class="w-90 p-3 rounded bg-white box-shadow h-100 d-flex flex-column">
      <div class="h3 fw-bold text-center w-100 border-bottom pb-3">{{ user.username }}</div>
      <div class="container h-100 d-flex flex-column">
        <div class="row h-80 mb-3">
          <div class="col-9 bg-theme-color custom-height rounded overflow-auto">
            <div v-if="currentChatbox">
              <div v-for="msg in msgList" :key="msg.id" :class="{ 'my-msg': msg.from == user.id }" class="p-3 py-4 m-3 msg-box w-60">
                {{ msg.msg }}
              </div>
              <div v-if="chatbox?.userIsTyping">
                {{ `${currentChatbox.customerName} さんが入力しています。。。` }}
              </div>
              <div v-else-if="currentChatbox.isEnding" class="d-flex h5 flex-column align-items-center w-100 fw-bold mt-5">
                {{ endedText }}
                <div class="mt-2">
                  {{ formatTimestamp(currentChatbox.lastEnd) }}
                </div>
              </div>
            </div>
            <div v-else class="d-flex align-items-center justify-content-center h-100 flex-column">
              <img :src="require('@/assets/svg/empty-hourglass-svgrepo-com.svg')" alt="chatbox" class="w-30 empty-text" />
              <div class="empty-text mt-5">Please select a chatbox</div>
            </div>
            <div ref="endElement" class="ended"></div>
          </div>
          <div class="col custom-height overflow-auto">
            <div
              v-for="chatbox in chatboxes"
              :key="chatbox.id"
              class="h-10 chatroom-bg my-2 rounded fw-bold p-3 d-flex justify-content-center align-items-center"
              @click="selectChatbox(chatbox)"
              :class="{ 'selected-chatbox': chatbox.id == currentChatbox?.id, notify: chatbox.notify == true }"
            >
              {{ chatbox.customerName }}
            </div>
          </div>
        </div>
        <div class="row border-top pt-3 flex-grow-1">
          <div class="col-9 px-0 h-100 d-flex justify-content-center align-items-center">
            <textarea
              v-model="inputMsg"
              type="text"
              class="bg-theme-color w-100 form-control fw-bold h-80 p-3"
              :placeholder="errorMsg ? errorMsg : '鑑定を開始します。'"
            />
          </div>
          <div class="col d-flex justify-content-around align-items-center">
            <button
              class="btn btn-danger h-80 w-40"
              @click="sendMsg()"
              :disabled="currentChatbox == null || inputMsg == ''"
              :class="{ inactive: currentChatbox == null || inputMsg == '' }"
            >
              送信
            </button>
            <button class="btn btn-secondary h-80 w-40" @click="endSession()">終了</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { getDocs, query, where, collection, addDoc, onSnapshot, orderBy, updateDoc, doc, whereIn, getDoc } from 'firebase/firestore'

export default {
  name: 'ChatBoxList',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')),
      chatboxes: [],
      inputMsg: '',
      currentChatbox: null,
      msgList: [],
      errorMsg: '',
      endedText: 'この鑑定は終了しました。',
      unsubscribe_box: null,
      unsubscribe_message: null,
      unsubcribe_unread: null,
      unreads: [],
      chatboxIds: [],
      chatbox: null,
      unsubcribe_chatbox: null
    }
  },
  // computed : {
  //  chatboxIds() {
  //    return this.chatboxes.map(chatbox => chatbox.id)
  //  }
  // },
  watch: {
    msgList() {
      this.$nextTick(() => {
        this.$refs.endElement?.scrollIntoView()
      })
    },
    currentChatbox() {
      this.updateUnread(this.currentChatbox)
    },
    inputMsg(newVal) {
      if (newVal != '') {
        this.isTyping(true)
        this.$nextTick(() => {
          this.$refs.endElement?.scrollIntoView()
        })
      } else {
        this.isTyping(false)
        this.$nextTick(() => {
          this.$refs.endElement?.scrollIntoView()
        })
      }
    }
  },
  methods: {
    async isTyping(status) {
      if (!this.currentChatbox) {
        return
      }
      console.log(status)
      const chatboxesCollection = collection(this.$firestore, 'chatboxes')
      const q = query(chatboxesCollection, where('id', '==', this.currentChatbox.id))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((docSnapshot) => {
        const docRef = doc(chatboxesCollection, docSnapshot.id)
        updateDoc(docRef, {
          readerIsTyping: status
        })
      })
    },
    updateUnread(chatbox) {
      if (!chatbox) return
      const unreads = this.unreads.filter((unread) => unread.chatbox == chatbox.id)
      if (unreads) {
        unreads.forEach((unread) => {
          const colRef = collection(this.$firestore, 'unread')
          const docRef = doc(colRef, unread.id)
          updateDoc(docRef, {
            isReaded: true
          })
        })
      }
    },
    getUnread() {
      const colRef = collection(this.$firestore, 'unread')
      const q = query(colRef, where('chatbox', 'in', this.chatboxIds), where('isReaded', '==', false))
      this.unsubcribe_unread = onSnapshot(q, (querySnapshot) => {
        this.unreads = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        this.chatboxes.forEach((chatbox) => {
          chatbox.notify = this.unreads.some((unread) => unread.chatbox === chatbox.id)
        })
        this.updateUnread(this.currentChatbox)
      })
    },
    getChatboxes() {
      const colRef = collection(this.$firestore, 'chatboxes')
      const q = query(colRef, where('reader', '==', this.user.id))

      this.unsubscribe_box = onSnapshot(q, (querySnapshot) => {
        this.chatboxes = querySnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }))
        this.chatboxIds = this.chatboxes.map((chatbox) => chatbox.id)
        this.getUnread()
      })
    },
    async sendMsg() {
      if (this.inputMsg.trim() === '') return

      if (this.currentChatbox.isEnding) {
        this.inputMsg = ''
        this.errorMsg = 'この鑑定は終了しました'
        return
      }
      const msg = this.inputMsg
      this.inputMsg = ''
      if (!msg) {
        this.errorMsg = 'チャットルームを選択してください。'
      } else if (!this.currentChatbox) {
        this.errorMsg = ''
      } else {
        const colRef = collection(this.$firestore, `${this.user.id}:${this.currentChatbox.user}`)

        await addDoc(colRef, {
          to: this.currentChatbox.user,
          from: this.user.id,
          msg: msg,
          createdAt: new Date()
        })
        this.inputMsg = ''
      }
    },
    async selectChatbox(chatbox) {
      this.msgList = ''
      this.currentChatbox = chatbox
      const boxColRef = collection(this.$firestore, 'chatboxes')
      const boxRef = doc(boxColRef, chatbox.docId)
      this.unsubcribe_chatbox = onSnapshot(boxRef, (doc) => {
        this.chatbox = { ...this.currentChatbox, ...doc.data() }
      })
      const colRef = collection(this.$firestore, `${this.user.id}:${chatbox.user}`)
      const q = query(colRef, orderBy('createdAt', 'asc'))

      if (typeof this.unsubscribe_message === 'function') {
        this.unsubscribe_message()
      }

      this.unsubscribe_message = onSnapshot(q, (querySnapshot) => {
        this.msgList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      })
    },
    async endSession() {
      if (!this.currentChatbox) {
        this.errorMsg = 'チャットルームを選択してください'
        return
      }
      const colRef = collection(this.$firestore, 'chatboxes')
      const docRef = doc(colRef, this.currentChatbox.docId)
      await updateDoc(docRef, {
        isEnding: true,
        lastEnd: new Date()
      })

      // this.currentChatbox = null
    },
    formatTimestamp(timestamp) {
      const date = timestamp.toDate()

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${year}/${month}/${day} ${hours}:${minutes}`
    }
  },
  async created() {
    await this.getChatboxes()
  },
  onUnmounted() {
    if (typeof this.unsubscribe_box === 'function') {
      this.unsubscribe_box()
    }

    if (typeof this.unsubscribe_message === 'function') {
      this.unsubscribe_message()
    }

    if (typeof this.unsubcribe_unread === 'function') {
      this.unsubcribe_unread()
    }

    if (typeof this.unsubcribe_chatbox === 'function') {
      this.unsubcribe_chatbox()
    }
  }
}
</script>

<style scoped>
.notify {
  background-color: #c3c3c3 !important;
}

.h-300 {
  height: 550px;
}

.box-shadow {
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}

.button-text {
  font-size: 1.5rem;
  color: #000;
}

.chatroom-bg {
  background-color: #f5f5f5;
}

.my-msg {
  background-color: #bdffbb !important;
  align-self: flex-end;
  margin-left: auto !important;
}

.other-msg {
  background-color: #f5f5f5;
  align-self: flex-start;
}

.msg-box {
  background-color: #ffffff;
  border-radius: 10px;
}

.custom-height {
  height: 550px;
}

.empty-text {
  color: #d6d6d6;
  font-size: 2rem;
  font-weight: bold;
}

.selected-chatbox {
  background-color: #f6ef93;
}

.inactive {
  background-color: #f79090;
}

@media screen and (max-width: 1024px) {
  .custom-height {
    height: 700px;
  }
}

@media screen and (max-width: 1440px) {
  .custom-height {
    height: 700px;
  }
}

@media screen and (min-width: 2560px) {
  .custom-height {
    height: 700px;
  }
}
</style>
