import { User } from "../../models/index.mjs";

export const tableData = async (req, res) => {
  const all_participants = await User.find({});
  const data = all_participants.map((participant) => {
    return {
      first_name: participant.first_name,
      last_name: participant.last_name,
      university: participant.university,
      verified: participant.verified,
    };
  });
  return res.status(200).json({ data: data });
};

const changeVerification = async (req, res) => {};
