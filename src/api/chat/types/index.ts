/** 文件类型 */
export interface ChatFile {
  /** 文件类型 */
  type: "image" | "file"
  /** 传输方法 */
  transfer_method: "remote_url" | "local_file"
  /** 文件 URL */
  url?: string
  /** 本地文件 */
  upload_file_id?: string
}

/** 发送对话消息请求参数 */
export interface SendChatMessageRequestData {
  /** 输入参数 */
  inputs?: Record<string, any>
  /** 用户查询内容 */
  query: string
  /** 响应模式：blocking(阻塞)或streaming(流式) */
  response_mode?: "blocking" | "streaming"
  /** 会话 ID，用于继续会话 */
  conversation_id?: string
  /** 用户标识（可选，不传则自动从 store 获取） */
  user?: string
  /** 文件列表 */
  files?: ChatFile[]
}

/** 对话消息响应数据（blocking 模式） */
export interface ChatMessageResponseData {
  /** 消息 ID */
  id: string
  /** 会话 ID */
  conversation_id: string
  /** 消息内容 */
  answer: string
  /** 创建时间 */
  created_at: number
}

/** Agent思考过程 */
export interface AgentThought {
  /** Agent思考ID，每一轮Agent迭代都会有一个唯一的id */
  id: string
  /** 任务ID，用于请求跟踪以防止停止响应接口 */
  task_id: string
  /** 消息唯一ID */
  message_id: string
  /** agent思考在消息中的位置，如第一轮迭代position为1 */
  position: number
  /** agent的思考内容 */
  thought: string
  /** 工具使用的返回结果 */
  observation: string
  /** 使用的工具列表，以;分割多个工具 */
  tool: string
  /** 工具的输入，JSON格式的字符串 */
  tool_input: string
  /** 创建时间戳 */
  created_at: number
  /** 当前 agent_thought 关联的文件ID */
  message_files: string[]
}

/** 流式响应数据块（streaming 模式） */
export interface ChatStreamChunk {
  /** 事件类型 */
  event: "message" | "agent_message" | "agent_thought" | "message_end" | "error"
  /** 消息 ID */
  message_id?: string
  /** 任务ID */
  task_id?: string
  /** 会话 ID */
  conversation_id?: string
  /** 增量答案内容 */
  answer?: string
  /** 创建时间 */
  created_at?: number
  /** 错误信息 */
  error?: string
  /** Agent思考过程（当event为agent_thought时） */
  thought?: string
  /** 工具观察结果 */
  observation?: string
  /** 使用的工具 */
  tool?: string
  /** 工具输入 */
  tool_input?: string
  /** agent思考的位置 */
  position?: number
  /** 关联的文件 */
  message_files?: string[]
}
