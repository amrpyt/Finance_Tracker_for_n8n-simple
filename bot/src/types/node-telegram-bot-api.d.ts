declare module 'node-telegram-bot-api' {
  export = TelegramBot;
  
  class TelegramBot {
    constructor(token: string, options?: TelegramBot.ConstructorOptions);
    
    getMe(): Promise<TelegramBot.User>;
    sendMessage(chatId: number | string, text: string, options?: any): Promise<TelegramBot.Message>;
    onText(regexp: RegExp, callback: (msg: TelegramBot.Message, match: RegExpExecArray | null) => void): void;
    on(event: string, listener: Function): void;
    stopPolling(): Promise<void>;
  }
  
  namespace TelegramBot {
    interface ConstructorOptions {
      polling?: boolean | PollingOptions;
      webhook?: boolean | WebHookOptions;
    }
    
    interface PollingOptions {
      interval?: number;
      autoStart?: boolean;
      params?: {
        timeout?: number;
      };
    }
    
    interface WebHookOptions {
      port?: number;
      host?: string;
    }
    
    interface User {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    }
    
    interface Chat {
      id: number;
      type: string;
      title?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
    }
    
    interface Message {
      message_id: number;
      from?: User;
      date: number;
      chat: Chat;
      text?: string;
    }
  }
}
