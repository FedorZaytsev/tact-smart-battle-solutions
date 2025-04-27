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



contract Proposal {
    votingEndingAt: Int as uint32;
    // possible replace with an array
    votes: map<Address, Bool>;

    // should be uint7
    size: Int as uint32 = 0;

    init(data: Init) {
        self.votingEndingAt = data.votingEndingAt;
        self.votes = emptyMap();
    }

    // deploy
    receive() { }

    receive(msg: Vote) {
        throwUnless(60, now() <= self.votingEndingAt);

        let sender = sender();


        throwUnless(61, self.size < 100);
        throwUnless(62, !self.votes.exists(sender));

        self.votes.set(sender, msg.value);
        self.size += 1;

        if (context().value > 40_000_000_000) {
            cashback(sender);
        }
    }

    get fun proposalState(): ProposalState {
        let yesCount: Int = 0;
        let noCount: Int = 0;

        foreach (address, vote in self.votes) {
            if (vote) {
                yesCount += 1;
            } else {
                noCount += 1;
            }
        }

        return ProposalState {
            yesCount: yesCount,
            noCount: noCount,
        };
    }
}
