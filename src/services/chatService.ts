import { supabase } from '../lib/supabase';
import { Attachment } from '../types';

export async function sendChatMessageToDB(
  householdId: string,
  senderId: string,
  senderName: string,
  content: string,
  attachment?: Attachment
) {
  if (!householdId || householdId.startsWith('hh_')) return;

  const { error } = await supabase.from('chat_messages').insert({
    household_id: householdId,
    sender_id: senderId.startsWith('usr_') ? null : senderId,
    sender_name: senderName,
    content,
    attachment_type: attachment?.type || null,
    attachment_title: attachment?.title || null,
    attachment_amount: attachment?.amount || null
  });

  if (error) {
    console.warn('Supabase chat_messages insert error:', error);
  }
}

export async function sendBuzzToDB(
  householdId: string,
  senderId: string,
  senderName: string,
  partnerName: string
) {
  if (!householdId || householdId.startsWith('hh_')) return;

  const buzzText = `⚡ Buzzed ${partnerName}`;

  const { error } = await supabase.from('chat_messages').insert({
    household_id: householdId,
    sender_id: senderId.startsWith('usr_') ? null : senderId,
    sender_name: senderName,
    content: buzzText
  });

  if (error) {
    console.warn('Supabase buzz message insert error:', error);
  }
}
