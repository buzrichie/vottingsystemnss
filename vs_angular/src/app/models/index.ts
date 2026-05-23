export interface Candidate {
  name: string;
  title: string;
}

export interface VotingPosition {
  position: string;
  candidates: Candidate[];
}

export interface LoginResponse {
  csrfToken: string;
  role: string;
  candidates: VotingPosition[];
}

export interface AdminLoginResponse {
  csrfToken: string;
  role: string;
  results: VoteResults;
}

export interface CandidateResult {
  name: string;
  votes: number;
}

export interface PositionResult {
  candidates: CandidateResult[];
  validVotes: number;
  invalidVotes: number;
}

export interface VoteStats {
  totalVoters: number;
  totalVotesCast: number;
}

export interface VoteResults {
  results: Record<string, PositionResult>;
  stats: VoteStats;
}

export interface ServerTime {
  serverTime: string;
  votingStartTime: string;
  votingEndTime: string;
}

export interface VotePayload {
  [position: string]: string;
}
