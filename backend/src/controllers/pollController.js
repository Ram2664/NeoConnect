const Poll = require("../models/Poll");
const Vote = require("../models/Vote");

async function createPoll(req, res) {
  try {
    const { question, options } = req.body;

    let optionList = options;

    if (typeof options === "string") {
      optionList = options
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (!Array.isArray(optionList) || optionList.length < 2) {
      res.status(400).json({ message: "Please add at least two poll options." });
      return;
    }

    const poll = await Poll.create({
      question,
      options: optionList.map((item) => ({
        label: item,
        votes: 0
      })),
      createdBy: req.user._id
    });

    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: "Could not create poll." });
  }
}

async function getPolls(req, res) {
  try {
    const polls = await Poll.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
      
    const pollIds = polls.map((poll) => poll._id);
    const voteMap = {};

    if (req.user) {
      const votes = await Vote.find({
        user: req.user._id,
        poll: { $in: pollIds }
      }).lean();

      votes.forEach((vote) => {
        voteMap[String(vote.poll)] = vote.optionIndex;
      });
    }

    const results = polls.map((poll) => {
      const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);

      return {
        ...poll,
        totalVotes,
        hasVoted: voteMap[String(poll._id)] !== undefined,
        selectedOption: voteMap[String(poll._id)]
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Could not load polls." });
  }
}

async function votePoll(req, res) {
  try {
    const { pollId, optionIndex } = req.body;
    const selectedOption = Number(optionIndex);

    const poll = await Poll.findById(pollId);

    if (!poll || !poll.active) {
      res.status(404).json({ message: "Poll not found." });
      return;
    }

    if (selectedOption < 0 || selectedOption >= poll.options.length) {
      res.status(400).json({ message: "Selected poll option is invalid." });
      return;
    }

    const existingVote = await Vote.findOne({
      user: req.user._id,
      poll: pollId
    });

    if (existingVote) {
      res.status(400).json({ message: "You can vote only once in this poll." });
      return;
    }

    await Vote.create({
      user: req.user._id,
      poll: pollId,
      optionIndex: selectedOption
    });

    poll.options[selectedOption].votes += 1;
    await poll.save();

    res.status(201).json({ message: "Vote submitted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not save vote." });
  }
}

module.exports = {
  createPoll,
  getPolls,
  votePoll
};
