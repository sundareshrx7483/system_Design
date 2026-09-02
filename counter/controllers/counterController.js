import Counter from "../model/counter.js";

export const getCount = async (req, res) => {
  try {
    let counter = await Counter.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );




    await counter.save();
    res.status(200).json({ count: counter.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
