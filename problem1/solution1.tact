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

struct Storage {
    // possible replace with an array
    votes: map<Address, Bool>;

    // should be uint7
    size: Int as uint32 = 0;
}

extends mutates fun add(self: Storage, address: Address, value: Bool) {
    require(self.size < 100, "First 100 votes received");
    require(!self.votes.exists(address), "Cannot vote twice");

    self.votes.set(address, value);
    self.size += 1;
}


contract Proposal {
    data: Init;
    storage: Storage;

    init(data: Init) {
        self.data = data;
        self.storage = Storage {
            votes: emptyMap(),
            size: 0,
        };
    }

    // deploy
    receive() { }

    receive(msg: Vote) {
        
        // get current time
        let currentTime: Int = now();

        // validation
        require(currentTime <= self.data.votingEndingAt, "Voting has ended");

        self.storage.add(sender(), msg.value);

        cashback(sender());
    }

    get fun proposalState(): ProposalState {
        let yesCount: Int = 0;
        let noCount: Int = 0;

        foreach (address, vote in self.storage.votes) {
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
