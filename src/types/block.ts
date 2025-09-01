export interface EdgeBlock {
  edge_key: string;
  block_name: string;
  description?: string | null;
}

export interface BlockTag {
  tag: string;
  description?: string | null;
  edge_key: string;
  block_name: string;
}

export interface BlockWithTags extends EdgeBlock {
  tags?: BlockTag[];
}
