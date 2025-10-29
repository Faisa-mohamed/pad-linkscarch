/*
  # Create Blockchain Table

  1. New Tables
    - blockchain table for transparent donation tracking
      - id (uuid, primary key)
      - block_index (integer, unique) - Position in the chain
      - timestamp (timestamptz) - When block was created
      - data (jsonb) - Transaction data
      - previous_hash (text) - Hash of previous block
      - hash (text) - Hash of current block
      - nonce (integer) - Proof of work nonce
      - created_at (timestamptz) - Record creation time
      
  2. Security
    - Enable RLS on blockchain table
    - Add policy for authenticated users to read all blockchain data
    - Add policy for authenticated users to insert blocks
    
  3. Indexes
    - Index on block_index for quick lookups
    - Index on hash for verification
*/

CREATE TABLE IF NOT EXISTS blockchain (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_index integer UNIQUE NOT NULL,
  timestamp timestamptz NOT NULL,
  data jsonb NOT NULL,
  previous_hash text NOT NULL,
  hash text NOT NULL,
  nonce integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blockchain ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blockchain data"
  ON blockchain
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert blocks"
  ON blockchain
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_blockchain_block_index ON blockchain(block_index);
CREATE INDEX IF NOT EXISTS idx_blockchain_hash ON blockchain(hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_timestamp ON blockchain(timestamp DESC);
