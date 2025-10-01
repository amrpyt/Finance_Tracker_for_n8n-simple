/**
 * Session management service
 * Handles multi-step conversation flows (e.g., account creation)
 */

interface AccountCreationSession {
  type: "account_creation";
  step: "awaiting_type" | "awaiting_name" | "awaiting_balance";
  data: {
    type?: "bank" | "cash" | "credit";
    name?: string;
    initialBalance?: number;
  };
}

type Session = AccountCreationSession;

/**
 * In-memory session storage
 * Maps userId to their current session
 */
class SessionManager {
  private sessions: Map<string, Session> = new Map();

  /**
   * Get user's current session
   */
  getSession(userId: string): Session | undefined {
    return this.sessions.get(userId);
  }

  /**
   * Set user's session
   */
  setSession(userId: string, session: Session): void {
    this.sessions.set(userId, session);
  }

  /**
   * Clear user's session
   */
  clearSession(userId: string): void {
    this.sessions.delete(userId);
  }

  /**
   * Check if user has an active session
   */
  hasSession(userId: string): boolean {
    return this.sessions.has(userId);
  }

  /**
   * Start account creation session
   */
  startAccountCreation(userId: string): void {
    this.setSession(userId, {
      type: "account_creation",
      step: "awaiting_type",
      data: {},
    });
  }

  /**
   * Update account creation session data
   */
  updateAccountCreation(
    userId: string,
    updates: Partial<AccountCreationSession["data"]>
  ): void {
    const session = this.getSession(userId);
    if (session && session.type === "account_creation") {
      session.data = { ...session.data, ...updates };
      this.setSession(userId, session);
    }
  }

  /**
   * Move to next step in account creation
   */
  nextAccountCreationStep(userId: string): void {
    const session = this.getSession(userId);
    if (session && session.type === "account_creation") {
      if (session.step === "awaiting_type") {
        session.step = "awaiting_name";
      } else if (session.step === "awaiting_name") {
        session.step = "awaiting_balance";
      }
      this.setSession(userId, session);
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
