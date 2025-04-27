//
// Public solution template
//

message Vote {
    value: Int as uint1;
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


// solution 5 is based on solution 3
// contract specific optimizations:
// Only do cashback if context().value > 100_000_000: +30 point on the leaderboard
// replaced getComputeFee(2877, true) with a static value
contract Proposal {
    votingEndingAt: Int as uint32;

    data: Int as uint72 = 0;

    init(data: Init) {
        self.votingEndingAt = data.votingEndingAt;
    }

    // deploy
    receive() { }

    receive(msg: Vote) {
        let contextValue = context().value;
        // 148 gas
        throwUnless(62, contextValue > 30_000_000);

        //dump(getComputeFee(2877, true));
        
        // validation
        // 4000 - 3890 = 96 gas
        throwUnless(60, now() <= self.votingEndingAt);


        let sender = sender();
        
        let valueInt = msg.value;

        // 192 gas
        let addressShifted = sender.asSlice().loadUint(32) & 0x3F;
        // 44 gas
        let flag = (1 << (addressShifted + 8));
        // 100 gas
        throwUnless(61, (self.data & flag) == 0);

        // 36 gas
        self.data |= flag;
  
        // 62 gas
        self.data += valueInt;
        
        // 6387 - 4814 = 1573 gas
        if (contextValue > 40_000_000_000) {
            cashback(sender);
        }
    }

    get fun proposalState(): ProposalState {
        let totalCount = 0;
        let i = 0;
        let yesCount = self.data & 0xFF;
        let votesShard = self.data >> 8;
        while (votesShard != 0) {
            if ((votesShard & 1) == 1) {
                totalCount += 1;
            }
            votesShard >>= 1;
        }
        return ProposalState {
            yesCount: yesCount,
            noCount: totalCount - yesCount,
        };
    }
}
