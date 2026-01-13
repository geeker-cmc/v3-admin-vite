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

/** 获取会话列表请求参数 */
export interface GetConversationsRequestData {
  /** 用户标识（必填） */
  user?: string
  /** 当前页最后一条记录的ID，默认null */
  last_id?: string | null
  /** 一次请求返回多少条记录，默认20条，范围1-100 */
  limit?: number
  /** 排序字段，默认-updated_at（按更新时间倒序） */
  sort_by?: "created_at" | "-created_at" | "updated_at" | "-updated_at"
}

/** 会话列表条目 */
export interface ConversationItem {
  /** 会话ID */
  id: string
  /** 会话名称 */
  name: string
  /** 用户输入参数 */
  inputs: Record<string, any>
  /** 会话状态 */
  status: string
  /** 开场白 */
  introduction: string | null
  /** 创建时间 */
  created_at: number
  /** 更新时间 */
  updated_at: number
}

/** 获取会话列表响应数据 */
export interface GetConversationsResponseData {
  /** 返回条数 */
  limit: number
  /** 是否存在下一页 */
  has_more: boolean
  /** 会话列表 */
  data: ConversationItem[]
}

/** 获取会话历史消息请求参数 */
export interface GetMessagesRequestData {
  /** 会话ID */
  conversation_id: string
  /** 用户标识（可选，不传则自动从 store 获取） */
  user?: string
  /** 当前页第一条天记录的ID，默认null */
  first_id?: string | null
  /** 一次请求返回多少条记录，默认20条 */
  limit?: number
}

/** 会话历史消息条目 */
export interface MessageItem {
  /** 消息ID */
  id: string
  /** 会话ID */
  conversation_id: string
  /** 用户输入参数 */
  inputs: Record<string, any>
  /** 用户输入/提问内容 */
  query: string
  /** 回答消息内容 */
  answer: string
  /** 消息文件列表 */
  message_files: any[]
  /** 反馈信息 */
  feedback: any | null
  /** 引用知识分段列表 */
  retriever_resources: any[]
  /** 创建时间 */
  created_at: number
}

/** 获取会话历史消息响应数据 */
export interface GetMessagesResponseData {
  /** 返回条数 */
  limit: number
  /** 是否存在下一页 */
  has_more: boolean
  /** 消息列表 */
  data: MessageItem[]
}

/** 删除会话请求参数 */
export interface DeleteConversationRequestData {
  /** 会话ID */
  conversation_id: string
  /** 用户标识（必填） */
  user: string
}

/** 重命名会话请求参数 */
export interface RenameConversationRequestData {
  /** 会话ID */
  conversation_id: string
  /** 用户标识（必填） */
  user: string
  /** 名称，若 auto_generate 为 true 时可不传 */
  name?: string | null
  /** 自动生成标题，默认 false */
  auto_generate?: boolean
}

/** 重命名会话响应数据 */
export interface RenameConversationResponseData {
  /** 会话ID */
  id: string
  /** 会话名称 */
  name: string
  /** 用户输入参数 */
  inputs: Record<string, any>
  /** 会话状态 */
  status: string
  /** 开场白 */
  introduction: string | null
  /** 创建时间 */
  created_at: number
  /** 更新时间 */
  updated_at: number
}
