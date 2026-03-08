import { TopBar } from '@/components/dashboard/TopBar'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default function ChatPage() {
  return (
    <div>
      <TopBar title="Team Chat" />
      <main className="p-6">
        <ChatInterface />
      </main>
    </div>
  )
}
