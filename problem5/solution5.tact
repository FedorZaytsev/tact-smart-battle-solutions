//
// Public solution template
//

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


// remove proposalid from init = -50 gas to 5169
// unpack all the variables = -72 gas to 5097
// inlining add and check = -110 gas to 4987
// switching from if and yes/no to totalCount and yesCountNegative = -33 gas to 4954
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
        throwUnless(1002, context().value > getComputeFee(4331, true));
        
        // validation
        // 4000 - 3890 = 96 gas
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
