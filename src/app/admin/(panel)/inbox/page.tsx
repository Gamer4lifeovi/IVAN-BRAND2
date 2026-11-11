import Inbox from "@/components/chat/Inbox";

export default function InboxPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold">Customer messages</h2>
      <p className="mb-5 text-sm text-muted">Every customer only ever sees their own conversation. When you are done with someone, use &quot;End &amp; clear chat&quot; to keep your inbox tidy.</p>
      <Inbox />
    </div>
  );
}
