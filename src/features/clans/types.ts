export type Clan = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  role: "admin" | "member";
  memberCount: number;
  maxSize: number;
};

export type ClansResponse = {
  clans: Clan[];
};

export type ClanMember = {
  id: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  role: "admin" | "member";
};
