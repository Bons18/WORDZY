"use client"

import { useState, useRef, useEffect } from "react"
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  RefreshCw,
  Lightbulb,
  Code,
  BookOpen,
  HelpCircle,
  Zap,
  Clock,
  CheckCircle
} from "lucide-react"
import enhancedAiService from "../services/enhancedAiService"

const ChatMentorPanel = ({ isOpen, onClose, context = null }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState("general") // general, sara, react-mentor
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Mensajes de bienvenida según el modo
  const welcomeMessages = {
    general: {
      text: "¡Hola! Soy tu asistente de IA. Puedo ayudarte con preguntas generales, explicaciones de conceptos y resolver dudas sobre tu aprendizaje. ¿En qué puedo ayudarte hoy?",
      icon: <Bot className="w-5 h-5 text-blue-600" />
    },
    sara: {
      text: "¡Hola! Soy SARA, tu asistente especializada en SENA. Puedo ayudarte con información sobre programas, procesos formativos, competencias y todo lo relacionado con tu formación en el SENA. ¿Qué necesitas saber?",
      icon: <BookOpen className="w-5 h-5 text-green-600" />
    },
    "react-mentor": {
      text: "¡Hola! Soy tu mentor experto en React 19. Puedo ayudarte con componentes, hooks, estado, efectos, optimización de rendimiento y las últimas características de React. ¿Qué quieres aprender hoy?",
      icon: <Code className="w-5 h-5 text-purple-600" />
    }
  }

  useEffect(() => {
    if (isOpen) {
      // Inicializar chat con mensaje de bienvenida
      const welcomeMessage = {
        id: Date.now(),
        text: welcomeMessages[chatMode].text,
        sender: "ai",
        timestamp: new Date(),
        mode: chatMode
      }
      setMessages([welcomeMessage])
      
      // Focus en el input
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, chatMode])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      let response
      const messageData = {
        message: userMessage.text,
        context: context ? {
          studentId: context.studentId,
          currentTopic: context.currentTopic,
          difficulty: context.difficulty,
          previousQuestions: context.previousQuestions
        } : null
      }

      switch (chatMode) {
        case "sara":
          response = await enhancedAiService.askSaraQuestion(messageData)
          break
        case "react-mentor":
          response = await callReactMentor(messageData)
          break
        default:
          response = await callGeneralChat(messageData)
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: response.response || response.answer || "Lo siento, no pude procesar tu pregunta. Intenta reformularla.",
        sender: "ai",
        timestamp: new Date(),
        mode: chatMode,
        suggestions: response.suggestions || [],
        resources: response.resources || []
      }

      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error("❌ Error en chat:", error)
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.",
        sender: "ai",
        timestamp: new Date(),
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const callGeneralChat = async (messageData) => {
    // Simular llamada al endpoint de chat general
    const response = await fetch('/api/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })

    if (!response.ok) {
      throw new Error('Error en chat general')
    }

    return await response.json()
  }

  const callReactMentor = async (messageData) => {
    // Simular llamada al endpoint de React mentor
    const response = await fetch('/api/v1/ai/react-mentor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })

    if (!response.ok) {
      throw new Error('Error en React mentor')
    }

    return await response.json()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: welcomeMessages[chatMode].text,
      sender: "ai",
      timestamp: new Date(),
      mode: chatMode
    }
    setMessages([welcomeMessage])
  }

  const getModeIcon = (mode) => {
    switch (mode) {
      case "sara": return <BookOpen className="w-4 h-4" />
      case "react-mentor": return <Code className="w-4 h-4" />
      default: return <Bot className="w-4 h-4" />
    }
  }

  const getModeColor = (mode) => {
    switch (mode) {
      case "sara": return "text-green-600 bg-green-50 border-green-200"
      case "react-mentor": return "text-purple-600 bg-purple-50 border-purple-200"
      default: return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  const formatMessage = (text) => {
    // Formatear texto con markdown básico
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Chat & Mentor IA
              </h2>
              <p className="text-sm text-gray-600">
                Asistente inteligente para tu aprendizaje
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Limpiar chat"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-center p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            {[
              { id: "general", label: "Chat General", icon: Bot },
              { id: "sara", label: "SARA SENA", icon: BookOpen },
              { id: "react-mentor", label: "React Mentor", icon: Code }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setChatMode(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  chatMode === id
                    ? getModeColor(id) + " border"
                    : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : message.isError
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === "ai" && (
                    <div className="flex-shrink-0 mt-1">
                      {getModeIcon(message.mode)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                    />
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-600">Sugerencias:</p>
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(suggestion)}
                            className="block w-full text-left text-xs bg-white border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors"
                          >
                            <Lightbulb className="w-3 h-3 inline mr-1" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Resources */}
                    {message.resources && message.resources.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-600">Recursos:</p>
                        {message.resources.map((resource, index) => (
                          <div key={index} className="text-xs bg-white border border-gray-200 rounded p-2">
                            <BookOpen className="w-3 h-3 inline mr-1" />
                            {resource}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.sender === "user" && (
                        <CheckCircle className="w-3 h-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" />
                <span className="text-sm text-gray-600">
                  {chatMode === "sara" ? "SARA está pensando..." : 
                   chatMode === "react-mentor" ? "El mentor está analizando..." : 
                   "Procesando tu mensaje..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Escribe tu ${chatMode === "sara" ? "consulta sobre SENA" : chatMode === "react-mentor" ? "pregunta sobre React" : "mensaje"}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>Respuesta típica: 2-5 segundos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMentorPanel