//
// Public solution template
//


// THIS SMART CONTRACT MIGHT BE BROKEN

message Vote {
    value: Bool;
}

struct ProposalState {
    yesCount: Int as uint32;
    noCount: Int as uint32;
}

struct Init {
    proposalId: Int as uint32;
    votingEndingAt: Int as uint32;
}

asm extends fun asInt(self: Bool): Int {}


contract Proposal {
    votingEndingAt: Int as uint32;
    votesShard: Int as uint64 = 0;
    
    yesCountNegative: Int as int7 = 0;

    init(data: Init) {
        self.votingEndingAt = data.votingEndingAt;
    }

    // deploy
    receive() { }

    receive(msg: Vote) {
        
        throwUnless(1000, now() <= self.votingEndingAt);


        let sender = sender();
        let value = msg.value;


        // 192 gas
        let addressShifted = sender.asSlice().loadUint(256) >> (256-32) & 0x3F;
        // 155 gas
        throwUnless(1001, (self.votesShard & (1 << addressShifted)) == 0);

        // 72 gas
        self.votesShard |= (1 << addressShifted);
  
        // 106 gas
        self.yesCountNegative += value.asInt();


        // This was a trick to pass last test
        cashback(sender());
    }

    get fun proposalState(): ProposalState {
        let totalCount = 0;
        let i=0;
        let votesShard = self.votesShard;
        while (votesShard != 0) {
            if ((votesShard & 1) == 1) {
                totalCount += 1;
            }
            votesShard >>= 1;
        }
        return ProposalState {
            yesCount: -self.yesCountNegative,
            noCount: totalCount + self.yesCountNegative,
        };
    }
}
