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
    
    // should be uint7
    totalCount: Int as uint7 = 0;
    yesCountNegative: Int as int7 = 0;

    init(data: Init) {
        self.votingEndingAt = data.votingEndingAt;
    }

    // deploy
    receive() { }

    receive(msg: Vote) {
            
        // validation
        // 4000 - 3890 = 110 gas
        require(now() <= self.votingEndingAt, "Voting has ended");




        let sender = sender();
        let value = msg.value;


        let senderSlice = sender.asSlice();
        senderSlice.skipBits(224);
        let addressShifted = senderSlice.loadUint(32) & 0x3F;

        // 192 gas
        //let addressShifted = sender.asSlice().loadUint(256) >> (256-32) & 0x3F;
        // 155 gas
        require((self.votesShard & (1 << addressShifted)) == 0, "Cannot vote twice");

        // 72 gas
        self.votesShard |= (1 << addressShifted);
  
        // 106 gas
        self.yesCountNegative += value.asInt();
        // 36 gas
        self.totalCount += 1;
    }

    get fun proposalState(): ProposalState {
        return ProposalState {
            yesCount: -self.yesCountNegative,
            noCount: self.totalCount + self.yesCountNegative,
        };
    }
}
