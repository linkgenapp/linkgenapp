import { AppLanguage } from '../store/authRole';

/** All UI strings for en / zh-Hant / zh-Hans. Firestore-backed content stays as stored unless you add per-field translations in the DB. */
const MESSAGES: Record<string, Record<AppLanguage, string>> = {
  appName: { en: 'LinkGen', 'zh-Hant': 'LinkGen', 'zh-Hans': 'LinkGen' },
  tagline: {
    en: 'Connect generations with kindness',
    'zh-Hant': '以善意連結世代',
    'zh-Hans': '以善意连结世代',
  },
  login: { en: 'Login', 'zh-Hant': '登入', 'zh-Hans': '登录' },
  signup: { en: 'Sign Up', 'zh-Hant': '註冊', 'zh-Hans': '注册' },
  email: { en: 'Email', 'zh-Hant': '電郵', 'zh-Hans': '邮箱' },
  password: { en: 'Password', 'zh-Hant': '密碼', 'zh-Hans': '密码' },
  displayName: { en: 'Display Name', 'zh-Hant': '顯示名稱', 'zh-Hans': '显示名称' },
  phone: { en: 'Phone Number', 'zh-Hant': '電話號碼', 'zh-Hans': '电话号码' },
  hkid: { en: 'HKID Number', 'zh-Hant': '香港身份證號碼', 'zh-Hans': '香港身份证号码' },
  language: { en: 'Language', 'zh-Hant': '語言', 'zh-Hans': '语言' },
  english: { en: 'English', 'zh-Hant': '英文', 'zh-Hans': '英文' },
  traditionalChinese: { en: 'Traditional Chinese', 'zh-Hant': '繁體中文', 'zh-Hans': '繁体中文' },
  simplifiedChinese: { en: 'Simplified Chinese', 'zh-Hant': '簡體中文', 'zh-Hans': '简体中文' },
  saveProfile: { en: 'Save Profile', 'zh-Hant': '儲存個人資料', 'zh-Hans': '保存个人资料' },
  profile: { en: 'Profile', 'zh-Hant': '個人檔案', 'zh-Hans': '个人资料' },
  iAmA: { en: 'I am a', 'zh-Hant': '我是', 'zh-Hans': '我是' },
  roleYouth: { en: 'Youth', 'zh-Hant': '青年', 'zh-Hans': '青年' },
  roleElderly: { en: 'Elderly', 'zh-Hant': '長者', 'zh-Hans': '长者' },
  waitPlease: { en: 'Please wait...', 'zh-Hant': '請稍候…', 'zh-Hans': '请稍候…' },
  missingInfo: { en: 'Missing info', 'zh-Hant': '資料不完整', 'zh-Hans': '资料不完整' },
  enterEmailPwd: { en: 'Please enter email and password.', 'zh-Hant': '請輸入電郵與密碼。', 'zh-Hans': '请输入邮箱与密码。' },
  enterDisplayName: { en: 'Please enter your display name.', 'zh-Hant': '請輸入顯示名稱。', 'zh-Hans': '请输入显示名称。' },
  enterHkidPhone: { en: 'Please enter HKID and phone number.', 'zh-Hant': '請輸入身份證與電話。', 'zh-Hans': '请输入身份证与电话。' },
  authFailed: { en: 'Authentication failed', 'zh-Hant': '登入失敗', 'zh-Hans': '登录失败' },
  tryAgain: { en: 'Please try again.', 'zh-Hant': '請再試一次。', 'zh-Hans': '请再试一次。' },

  tabTasks: { en: 'Tasks', 'zh-Hant': '任務', 'zh-Hans': '任务' },
  tabEvents: { en: 'Events', 'zh-Hant': '活動', 'zh-Hans': '活动' },
  tabMatches: { en: 'Matches', 'zh-Hant': '配對', 'zh-Hans': '配对' },
  tabHelpRequests: { en: 'Help', 'zh-Hant': '求助', 'zh-Hans': '求助' },
  tabChat: { en: 'Chat', 'zh-Hant': '聊天', 'zh-Hans': '聊天' },
  tabProfile: { en: 'Profile', 'zh-Hant': '個人', 'zh-Hans': '个人' },
  tabMap: { en: 'Map', 'zh-Hant': '地圖', 'zh-Hans': '地图' },
  tabNewRequest: { en: 'New', 'zh-Hant': '新增', 'zh-Hans': '新建' },

  tasksNearYou: { en: 'Tasks Near You', 'zh-Hant': '附近任務', 'zh-Hans': '附近任务' },
  labelHost: { en: 'Host', 'zh-Hant': '發起人', 'zh-Hans': '发起人' },
  labelGoing: { en: 'going', 'zh-Hant': '人參與', 'zh-Hans': '人参与' },
  loadingActivities: { en: 'Loading activities...', 'zh-Hant': '載入任務中…', 'zh-Hans': '加载任务中…' },
  noTasks: { en: 'No tasks available.', 'zh-Hant': '暫時沒有任務。', 'zh-Hans': '暂时没有任务。' },
  youthOnly: { en: 'This screen is for youth users.', 'zh-Hant': '此畫面只供青年使用。', 'zh-Hans': '此画面仅供青年使用。' },
  elderlyOnly: { en: 'This screen is for elderly users.', 'zh-Hant': '此畫面只供長者使用。', 'zh-Hans': '此画面仅供长者使用。' },
  done: { en: 'Done', 'zh-Hant': '完成', 'zh-Hans': '完成' },
  noMoreTasks: { en: 'No more tasks right now.', 'zh-Hant': '暫時沒有更多任務。', 'zh-Hans': '暂时没有更多任务。' },
  couldNotSaveSwipe: { en: 'Could not save swipe', 'zh-Hant': '無法儲存滑動', 'zh-Hans': '无法保存滑动' },
  helpRequest: { en: 'Help Request', 'zh-Hant': '求助', 'zh-Hans': '求助' },
  flexible: { en: 'Flexible', 'zh-Hant': '彈性', 'zh-Hans': '弹性' },
  elderlyUser: { en: 'Elderly User', 'zh-Hant': '長者用戶', 'zh-Hans': '长者用户' },
  youthUser: { en: 'Youth User', 'zh-Hant': '青年用戶', 'zh-Hans': '青年用户' },

  time_morning: { en: 'morning', 'zh-Hant': '上午', 'zh-Hans': '上午' },
  time_afternoon: { en: 'afternoon', 'zh-Hant': '下午', 'zh-Hans': '下午' },
  time_evening: { en: 'evening', 'zh-Hant': '晚上', 'zh-Hans': '晚上' },
  time_flexible: { en: 'flexible', 'zh-Hant': '彈性', 'zh-Hans': '弹性' },

  taskDescSample: {
    en: 'Friendly one-time support request from an elderly resident in your district.',
    'zh-Hant': '同區長者需要的一次性協助。',
    'zh-Hans': '同区长者需要的一次性协助。',
  },

  task_sample_0: { en: 'Accompany me to clinic', 'zh-Hant': '陪我就診', 'zh-Hans': '陪我就诊' },
  task_sample_1: { en: 'Help carry groceries', 'zh-Hant': '幫手買餸', 'zh-Hans': '帮手买菜' },
  task_sample_2: { en: 'Teach me WhatsApp', 'zh-Hant': '教我 WhatsApp', 'zh-Hans': '教我 WhatsApp' },
  task_sample_3: { en: 'Aircon cleaning help', 'zh-Hant': '冷氣清潔協助', 'zh-Hans': '冷气清洁协助' },
  task_sample_4: { en: 'Tea chat companion', 'zh-Hant': '飲茶傾偈陪伴', 'zh-Hans': '饮茶聊天陪伴' },
  task_sample_5: { en: 'Help with online forms', 'zh-Hant': '協助網上表格', 'zh-Hans': '协助网上表格' },

  elder_mrs_chan: { en: 'Mrs. Chan', 'zh-Hant': '陳婆婆', 'zh-Hans': '陈婆婆' },
  elder_mr_wong: { en: 'Mr. Wong', 'zh-Hant': '黃先生', 'zh-Hans': '黄先生' },
  elder_auntie_lee: { en: 'Auntie Lee', 'zh-Hant': '李姨', 'zh-Hans': '李姨' },

  cat_transport: { en: 'Transport', 'zh-Hant': '交通', 'zh-Hans': '交通' },
  cat_groceries: { en: 'Groceries', 'zh-Hant': '買餸', 'zh-Hans': '买菜' },
  cat_cleaning: { en: 'Cleaning', 'zh-Hant': '清潔', 'zh-Hans': '清洁' },
  cat_cooking: { en: 'Cooking', 'zh-Hant': '煮食', 'zh-Hans': '煮食' },
  cat_companionship: { en: 'Companionship', 'zh-Hant': '陪伴', 'zh-Hans': '陪伴' },
  cat_tech_help: { en: 'Tech Help', 'zh-Hant': '科技協助', 'zh-Hans': '科技协助' },
  cat_errands: { en: 'Errands', 'zh-Hant': '跑腿', 'zh-Hans': '跑腿' },
  cat_other: { en: 'Other', 'zh-Hant': '其他', 'zh-Hans': '其他' },

  matchHeading: { en: 'Mutual Matches', 'zh-Hant': '互相配對', 'zh-Hans': '互相配对' },
  matchSub: {
    en: 'People who want to help your community requests',
    'zh-Hant': '想協助你社區求助的夥伴',
    'zh-Hans': '想协助你社区求助的伙伴',
  },
  labelType: { en: 'Type', 'zh-Hant': '類型', 'zh-Hans': '类型' },
  type_task: { en: 'task', 'zh-Hant': '任務', 'zh-Hans': '任务' },
  type_event: { en: 'event', 'zh-Hant': '活動', 'zh-Hans': '活动' },
  labelMatchId: { en: 'Match ID', 'zh-Hant': '配對編號', 'zh-Hans': '配对编号' },
  loadingMatches: { en: 'Loading your matches...', 'zh-Hant': '載入配對中…', 'zh-Hans': '加载配对中…' },
  noMatchesHint: {
    en: 'No matches yet. Swipe right on tasks you like.',
    'zh-Hant': '暫未有配對。向右滑表示想幫忙。',
    'zh-Hans': '暂无配对。向右滑表示想帮忙。',
  },
  sample_match_1: { en: 'Accompany me to clinic', 'zh-Hant': '陪我就診', 'zh-Hans': '陪我就诊' },
  sample_match_2: { en: 'Mahjong Night', 'zh-Hant': '麻雀之夜', 'zh-Hans': '麻雀之夜' },

  mapTitle: { en: 'Tasks & Activities Map', 'zh-Hant': '任務與活動地圖', 'zh-Hans': '任务与活动地图' },
  mapYouthOnly: { en: 'Map is available for youth.', 'zh-Hant': '地圖只供青年使用。', 'zh-Hans': '地图仅供青年使用。' },
  mapUnavailable: { en: 'Map unavailable', 'zh-Hant': '暫時無法顯示地圖', 'zh-Hans': '暂时无法显示地图' },
  mapBackupHint: {
    en: 'Showing nearby items as a list. Try: npx expo start -c',
    'zh-Hant': '以清單顯示附近項目。可試：npx expo start -c',
    'zh-Hans': '以列表显示附近项目。可试：npx expo start -c',
  },
  legendTask: { en: 'Task', 'zh-Hant': '任務', 'zh-Hans': '任务' },
  legendActivity: { en: 'Activity', 'zh-Hant': '活動', 'zh-Hans': '活动' },
  unknown: { en: 'Unknown', 'zh-Hant': '未知', 'zh-Hans': '未知' },
  communityEvent: { en: 'Community Event', 'zh-Hant': '社區活動', 'zh-Hans': '社区活动' },

  chatsTitle: { en: 'Chats', 'zh-Hant': '聊天', 'zh-Hans': '聊天' },
  chatPick: { en: 'Choose someone to chat', 'zh-Hant': '選擇聊天對象', 'zh-Hans': '选择聊天对象' },
  chatPickSub: {
    en: 'Choose a person to start chatting',
    'zh-Hant': '選擇對象開始聊天',
    'zh-Hans': '选择对象开始聊天',
  },
  open: { en: 'Open', 'zh-Hant': '開啟', 'zh-Hans': '打开' },
  back: { en: 'Back', 'zh-Hant': '返回', 'zh-Hans': '返回' },
  typeMessage: { en: 'Type message...', 'zh-Hant': '輸入訊息…', 'zh-Hans': '输入消息…' },
  send: { en: 'Send', 'zh-Hant': '傳送', 'zh-Hans': '发送' },
  translate: { en: 'Translate', 'zh-Hant': '翻譯', 'zh-Hans': '翻译' },
  hide: { en: 'Hide', 'zh-Hant': '隱藏', 'zh-Hans': '隐藏' },
  langTag: { en: 'lang', 'zh-Hant': '語言', 'zh-Hans': '语言' },
  metaElderly: { en: 'Elderly user', 'zh-Hant': '長者用戶', 'zh-Hans': '长者用户' },
  metaYouth: { en: 'Youth volunteer', 'zh-Hant': '青年義工', 'zh-Hans': '青年义工' },

  name_chan: { en: 'Mrs. Chan', 'zh-Hant': '陳婆婆', 'zh-Hans': '陈婆婆' },
  name_wong: { en: 'Mr. Wong', 'zh-Hant': '黃先生', 'zh-Hans': '黄先生' },
  name_kai: { en: 'Kai', 'zh-Hant': '阿楷', 'zh-Hans': '阿楷' },
  name_mei: { en: 'Mei', 'zh-Hant': '阿美', 'zh-Hans': '阿美' },

  uidLabel: { en: 'UID', 'zh-Hant': '帳戶 ID', 'zh-Hans': '账户 ID' },
  currentRole: { en: 'Role', 'zh-Hant': '身份', 'zh-Hans': '身份' },
  labelBio: { en: 'Bio', 'zh-Hant': '簡介', 'zh-Hans': '简介' },
  labelDistrict: { en: 'District', 'zh-Hant': '地區', 'zh-Hans': '地区' },
  switchYouth: { en: 'Youth mode', 'zh-Hant': '青年介面', 'zh-Hans': '青年界面' },
  switchElderly: { en: 'Elderly mode', 'zh-Hant': '長者介面', 'zh-Hans': '长者界面' },
  noteDemo: {
    en: 'Use role switch to demo both interfaces.',
    'zh-Hant': '切換身份以體驗兩種介面。',
    'zh-Hans': '切换身份以体验两种界面。',
  },

  reqHero: { en: 'My Help Requests', 'zh-Hant': '我的求助', 'zh-Hans': '我的求助' },
  reqSub: { en: 'Clear and simple tracking', 'zh-Hant': '清晰追蹤你的求助', 'zh-Hans': '清晰追踪你的求助' },
  newHelpBtn: { en: '+ New Help Request', 'zh-Hant': '+ 新增求助', 'zh-Hans': '+ 新增求助' },
  sectionInterested: { en: 'Interested youth', 'zh-Hant': '感興趣的青年', 'zh-Hans': '感兴趣的青年' },
  noMatchYet: { en: 'No one matched yet.', 'zh-Hant': '暫時未有配對。', 'zh-Hans': '暂时没有配对。' },
  yourPosted: { en: 'Your posted tasks', 'zh-Hant': '你已發布的任務', 'zh-Hans': '你已发布的任务' },
  noRequests: { en: 'No requests yet.', 'zh-Hant': '尚未發布求助。', 'zh-Hans': '尚未发布求助。' },
  timeLine: { en: 'Time', 'zh-Hant': '時間', 'zh-Hans': '时间' },
  locationLine: { en: 'Location', 'zh-Hant': '地點', 'zh-Hans': '地点' },
  edit: { en: 'Edit', 'zh-Hant': '編輯', 'zh-Hans': '编辑' },
  delete: { en: 'Delete', 'zh-Hant': '刪除', 'zh-Hans': '删除' },
  youthLabel: { en: 'Youth', 'zh-Hant': '青年', 'zh-Hans': '青年' },
  interestedIn: { en: 'Interested in', 'zh-Hant': '感興趣', 'zh-Hans': '感兴趣' },
  editSoon: { en: 'Coming soon', 'zh-Hant': '即將推出', 'zh-Hans': '即将推出' },
  editSoonMsg: { en: 'Edit is a placeholder in this prototype.', 'zh-Hant': '此版本暫不支援編輯。', 'zh-Hans': '此版本暂不支持编辑。' },

  evHero: { en: 'Community Events', 'zh-Hant': '社區活動', 'zh-Hans': '社区活动' },
  evSub: { en: 'Events in your district', 'zh-Hant': '你區內的活動', 'zh-Hans': '你区内的活动' },
  evReadName1: { en: 'Hong Kong History Talk', 'zh-Hant': '香港歷史講座', 'zh-Hans': '香港历史讲座' },
  evReadLoc1: { en: 'Central Library', 'zh-Hant': '中央圖書館', 'zh-Hans': '中央图书馆' },
  evReadTime1: { en: 'Sat 2:00 PM', 'zh-Hant': '星期六 下午2時', 'zh-Hans': '星期六 下午2时' },
  evReadDesc1: { en: 'Intergenerational sharing night.', 'zh-Hant': '跨代分享夜。', 'zh-Hans': '跨代分享夜。' },
  evReadName2: { en: 'Cantonese Opera Workshop', 'zh-Hant': '粵劇工作坊', 'zh-Hans': '粤剧工作坊' },
  evReadLoc2: { en: 'Tsim Sha Tsui', 'zh-Hant': '尖沙咀', 'zh-Hans': '尖沙咀' },
  evReadTime2: { en: 'Sun 4:00 PM', 'zh-Hant': '星期日 下午4時', 'zh-Hans': '星期日 下午4时' },
  evReadDesc2: { en: 'Beginner-friendly workshop.', 'zh-Hant': '適合新手的工作坊。', 'zh-Hans': '适合新手的工作坊。' },
  districtPrefix: { en: 'District', 'zh-Hant': '地區', 'zh-Hans': '地区' },
  tbd: { en: 'TBD', 'zh-Hant': '待定', 'zh-Hans': '待定' },

  nrTitle: { en: 'Ask for Help', 'zh-Hant': '發布求助', 'zh-Hans': '发布求助' },
  nrSub: { en: 'Large text, simple form', 'zh-Hant': '大字、簡單表格', 'zh-Hans': '大字、简单表格' },
  nrWhat: { en: 'What do you need?', 'zh-Hant': '需要甚麼協助？', 'zh-Hans': '需要什么协助？' },
  nrPhTitle: { en: 'e.g. carry groceries', 'zh-Hant': '例如：幫手買餸', 'zh-Hans': '例如：帮手买菜' },
  nrPhDate: { en: 'e.g. Friday 5 PM', 'zh-Hant': '例如：星期五下午5時', 'zh-Hans': '例如：星期五下午5点' },
  nrDateTime: { en: 'Date & time', 'zh-Hant': '日期與時間', 'zh-Hans': '日期与时间' },
  nrCategory: { en: 'Category', 'zh-Hant': '類型', 'zh-Hans': '类型' },
  nrDistrict: { en: 'District', 'zh-Hant': '地區', 'zh-Hans': '地区' },
  nrPrefTime: { en: 'Preferred time', 'zh-Hant': '偏好時段', 'zh-Hans': '偏好时段' },
  nrNotes: { en: 'Notes', 'zh-Hant': '備註', 'zh-Hans': '备注' },
  nrUrgency: { en: 'Urgency', 'zh-Hant': '急切程度', 'zh-Hans': '急切程度' },
  urg_low: { en: 'low', 'zh-Hant': '低', 'zh-Hans': '低' },
  urg_medium: { en: 'medium', 'zh-Hant': '中', 'zh-Hans': '中' },
  urg_high: { en: 'high', 'zh-Hant': '高', 'zh-Hans': '高' },
  saveRequest: { en: 'Save Request', 'zh-Hant': '儲存求助', 'zh-Hans': '保存求助' },
  saving: { en: 'Saving...', 'zh-Hant': '儲存中…', 'zh-Hans': '保存中…' },
  fillRequired: { en: 'Please fill required fields', 'zh-Hant': '請填寫必填項目', 'zh-Hans': '请填写必填项' },
  saved: { en: 'Saved', 'zh-Hant': '已儲存', 'zh-Hans': '已保存' },
  saveErr: { en: 'Could not save', 'zh-Hant': '無法儲存', 'zh-Hans': '无法保存' },
  saveErrMsg: { en: 'Please try again shortly.', 'zh-Hant': '請稍後再試。', 'zh-Hans': '请稍后再试。' },

  yevTitle: { en: 'Events', 'zh-Hant': '活動', 'zh-Hans': '活动' },
  yevDashTitle: { en: 'Events dashboard', 'zh-Hant': '活動列表', 'zh-Hans': '活动列表' },
  yevHint: { en: 'Browse and register for events', 'zh-Hant': '瀏覽並報名活動', 'zh-Hans': '浏览并报名活动' },
  hostFallback: { en: 'Event host', 'zh-Hant': '活動主辦', 'zh-Hans': '活动主办' },
  loadingEvents: { en: 'Loading events...', 'zh-Hant': '載入活動中…', 'zh-Hans': '加载活动中…' },
  organizer: { en: 'Organizer', 'zh-Hant': '主辦', 'zh-Hans': '主办' },
  capacity: { en: 'Capacity', 'zh-Hant': '名額', 'zh-Hans': '名额' },
  spotsLeft: { en: 'spots left', 'zh-Hant': '剩餘名額', 'zh-Hans': '剩余名额' },
  register: { en: 'Register', 'zh-Hant': '報名', 'zh-Hans': '报名' },
  registered: { en: 'Registered', 'zh-Hant': '已報名', 'zh-Hans': '已报名' },
  full: { en: 'Full', 'zh-Hant': '已滿', 'zh-Hans': '已满' },
  registering: { en: 'Registering...', 'zh-Hant': '報名中…', 'zh-Hans': '报名中…' },
  eventFull: { en: 'Event full', 'zh-Hant': '活動已滿', 'zh-Hans': '活动已满' },
  eventFullMsg: { en: 'This event reached capacity.', 'zh-Hant': '此活動已滿額。', 'zh-Hans': '此活动已满额。' },
  alreadyIn: { en: 'Already registered', 'zh-Hant': '你已報名', 'zh-Hans': '你已报名' },
  alreadyInMsg: { en: 'You already joined this event.', 'zh-Hant': '你已報名此活動。', 'zh-Hans': '你已报名此活动。' },

  evs_0: { en: 'Tai Chi Tuesdays', 'zh-Hant': '太極星期二', 'zh-Hans': '太极星期二' },
  evs_1: { en: 'Mahjong Monday Morning', 'zh-Hant': '星期一早上麻雀', 'zh-Hans': '星期一早上麻雀' },
  evs_2: { en: 'Cantonese Opera Workshop', 'zh-Hant': '粵劇工作坊', 'zh-Hans': '粤剧工作坊' },
  evs_3: { en: 'Dim Sum Social', 'zh-Hant': '點心聚會', 'zh-Hans': '点心聚会' },
  evs_4: { en: 'Hong Kong Story Night', 'zh-Hant': '香港故事夜', 'zh-Hans': '香港故事夜' },
  evDescSample: {
    en: 'Community event for elders and youth to connect safely.',
    'zh-Hant': '讓長者與青年在安全環境中交流。',
    'zh-Hans': '让长者与青年在安全环境中交流。',
  },
  host_golden: { en: 'GoldenBridge Centre', 'zh-Hant': '金橋中心', 'zh-Hans': '金桥中心' },

  evc_cultural: { en: 'Cultural', 'zh-Hant': '文化', 'zh-Hans': '文化' },
  evc_games: { en: 'Games', 'zh-Hant': '遊戲', 'zh-Hans': '游戏' },
  evc_food: { en: 'Food', 'zh-Hant': '飲食', 'zh-Hans': '饮食' },
  evc_exercise: { en: 'Exercise', 'zh-Hant': '運動', 'zh-Hans': '运动' },
  evc_learning: { en: 'Learning', 'zh-Hant': '學習', 'zh-Hans': '学习' },
  evc_social: { en: 'Social', 'zh-Hant': '社交', 'zh-Hans': '社交' },
  evc_outdoor: { en: 'Outdoor', 'zh-Hant': '戶外', 'zh-Hans': '户外' },
  evc_other: { en: 'Other', 'zh-Hant': '其他', 'zh-Hans': '其他' },
  evc_wellness: { en: 'Wellness', 'zh-Hant': '身心健康', 'zh-Hans': '身心健康' },

  map_pin_groceries: { en: 'Help carry groceries', 'zh-Hant': '幫手買餸', 'zh-Hans': '帮手买菜' },
  map_pin_doctor: { en: 'Accompany to doctor', 'zh-Hant': '陪診', 'zh-Hans': '陪诊' },
  map_pin_taichi: { en: 'Tai Chi Tuesday', 'zh-Hant': '太極星期二', 'zh-Hans': '太极星期二' },
};

const DISTRICT_KEYS = [
  'central_western',
  'eastern',
  'southern',
  'wan_chai',
  'kowloon_city',
  'kwun_tong',
  'sham_shui_po',
  'wong_tai_sin',
  'yau_tsim_mong',
  'islands',
  'kwai_tsing',
  'north',
  'sai_kung',
  'sha_tin',
  'tai_po',
  'tsuen_wan',
  'tuen_mun',
  'yuen_long',
] as const;

const DISTRICT_I18N: Record<string, Record<AppLanguage, string>> = {
  central_western: { en: 'Central & Western', 'zh-Hant': '中西區', 'zh-Hans': '中西区' },
  eastern: { en: 'Eastern', 'zh-Hant': '東區', 'zh-Hans': '东区' },
  southern: { en: 'Southern', 'zh-Hant': '南區', 'zh-Hans': '南区' },
  wan_chai: { en: 'Wan Chai', 'zh-Hant': '灣仔', 'zh-Hans': '湾仔' },
  kowloon_city: { en: 'Kowloon City', 'zh-Hant': '九龍城', 'zh-Hans': '九龙城' },
  kwun_tong: { en: 'Kwun Tong', 'zh-Hant': '觀塘', 'zh-Hans': '观塘' },
  sham_shui_po: { en: 'Sham Shui Po', 'zh-Hant': '深水埗', 'zh-Hans': '深水埗' },
  wong_tai_sin: { en: 'Wong Tai Sin', 'zh-Hant': '黃大仙', 'zh-Hans': '黄大仙' },
  yau_tsim_mong: { en: 'Yau Tsim Mong', 'zh-Hant': '油尖旺', 'zh-Hans': '油尖旺' },
  islands: { en: 'Islands', 'zh-Hant': '離島', 'zh-Hans': '离岛' },
  kwai_tsing: { en: 'Kwai Tsing', 'zh-Hant': '葵青', 'zh-Hans': '葵青' },
  north: { en: 'North', 'zh-Hant': '北區', 'zh-Hans': '北区' },
  sai_kung: { en: 'Sai Kung', 'zh-Hant': '西貢', 'zh-Hans': '西贡' },
  sha_tin: { en: 'Sha Tin', 'zh-Hant': '沙田', 'zh-Hans': '沙田' },
  tai_po: { en: 'Tai Po', 'zh-Hant': '大埔', 'zh-Hans': '大埔' },
  tsuen_wan: { en: 'Tsuen Wan', 'zh-Hant': '荃灣', 'zh-Hans': '荃湾' },
  tuen_mun: { en: 'Tuen Mun', 'zh-Hant': '屯門', 'zh-Hans': '屯门' },
  yuen_long: { en: 'Yuen Long', 'zh-Hant': '元朗', 'zh-Hans': '元朗' },
};

export function districtLabel(lang: AppLanguage, key: string): string {
  return DISTRICT_I18N[key]?.[lang] ?? DISTRICT_I18N.central_western[lang];
}

export function taskCategoryLabel(lang: AppLanguage, key: string): string {
  const row = MESSAGES[`cat_${key}`];
  return row?.[lang] ?? MESSAGES.cat_other[lang];
}

export function eventCategoryLabel(lang: AppLanguage, key: string): string {
  const row = MESSAGES[`evc_${key}`];
  return row?.[lang] ?? MESSAGES.evc_other[lang];
}

export function timeSlotLabel(lang: AppLanguage, key: string): string {
  const row = MESSAGES[`time_${key}`];
  return row?.[lang] ?? key;
}

export function formatMaybeTimeSlot(lang: AppLanguage, raw: string): string {
  const slots = ['morning', 'afternoon', 'evening', 'flexible'];
  if (slots.includes(raw)) return timeSlotLabel(lang, raw);
  return raw;
}

export { DISTRICT_KEYS };

export const t = (language: AppLanguage, key: string, fallback?: string) =>
  MESSAGES[key]?.[language] ?? fallback ?? key;
