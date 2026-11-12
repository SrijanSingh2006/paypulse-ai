import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Api } from '../api/endpoints';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  ts: number;
  actions?: string[];
}

const SUGGESTIONS = [
  'How much can I advance today?',
  'What is my learning allowance?',
  'How does the wage accrual formula work?',
  'Show me my pending expense claims',
];

export const AICopilotScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: "👋 Hi! I'm your **PayPulse benefits copilot**. Ask about your demo wage balance, expense claims, payroll breakdown, EdTech allowance, or company policies.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: query, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await Api.askCopilot(query);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: res.reply || 'I couldn\'t find an answer for that.',
        ts: Date.now(),
        actions: res.suggestedActions,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'ai', text: "I'm having trouble connecting right now. Please try again shortly.", ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Benefits Copilot</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Demo workspace · benefits guide</Text>
            </View>
          </View>
        </View>
        <View style={styles.poweredBadge}>
          <Ionicons name="flash" size={11} color={Colors.accentLight} />
          <Text style={styles.poweredText}>Policy engine</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={styles.messageBlock}>
            <View style={[styles.messageRow, msg.role === 'user' ? styles.userRow : styles.aiRow]}>
              {msg.role === 'ai' && (
                <View style={styles.aiBubbleAvatar}>
                  <Ionicons name="sparkles" size={13} color={Colors.primary} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.role === 'user' ? styles.userText : styles.aiText,
                  ]}
                >
                  {msg.text.split('**').map((part, index) => (
                    <Text key={`${msg.id}-${index}`} style={index % 2 === 1 ? styles.messageEmphasis : undefined}>
                      {part}
                    </Text>
                  ))}
                </Text>
                <Text style={[styles.messageTime, msg.role === 'user' ? styles.userMessageTime : styles.aiMessageTime]}>
                  {formatTime(msg.ts)}
                </Text>
              </View>
            </View>
            {msg.role === 'ai' && !!msg.actions?.length && (
              <View style={styles.responseActions}>
                {msg.actions.map((action) => (
                  <TouchableOpacity
                    key={`${msg.id}-${action}`}
                    style={styles.responseAction}
                    onPress={() => sendMessage(action)}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.responseActionText}>{action}</Text>
                    <Ionicons name="arrow-forward" size={12} color={Colors.accentLight} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <View style={styles.aiBubbleAvatar}>
              <Ionicons name="sparkles" size={13} color={Colors.primary} />
            </View>
            <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.typingText}>Thinking…</Text>
            </View>
          </View>
        )}

        {/* Suggestions (shown when fresh) */}
        {messages.length <= 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggested questions</Text>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => sendMessage(s)}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={13} color={Colors.primary} />
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about wages, expenses, payroll…"
          placeholderTextColor={Colors.textMuted}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  poweredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  poweredText: {
    fontSize: 11,
    color: Colors.accentLight,
    fontWeight: '700',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageBlock: {
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiBubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: Colors.onPrimary,
    fontWeight: '600',
  },
  aiText: {
    color: Colors.text,
  },
  messageEmphasis: {
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  responseActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingLeft: 36,
  },
  responseAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  responseActionText: {
    color: Colors.accentLight,
    fontSize: 11,
    fontWeight: '700',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  aiMessageTime: {
    color: Colors.textMuted,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  typingText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  suggestionText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    paddingBottom: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.cardSecondary,
    opacity: 0.6,
  },
});
