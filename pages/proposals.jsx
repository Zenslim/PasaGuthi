import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const dummyProposals = [
  { title: "Fund Bhaktapur Woodcarving Apprenticeship", votes: { yes: 14, no: 2 }, status: "Active" },
  { title: "Launch Diaspora Fellowship Program", votes: { yes: 22, no: 3 }, status: "Active" },
  { title: "Host Virtual Yenya Jatra", votes: { yes: 40, no: 1 }, status: "Completed" },
];

export default function Proposals() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white p-6">
        <h1 className="text-3xl font-bold mb-4">DAO Proposals</h1>
        <p className="mb-6">Participate in decisions shaping the future of the Newar community.</p>
        <div className="space-y-4">
          {dummyProposals.map((proposal, index) => (
            <div key={index} className="p-4 border rounded shadow-sm">
              <h2 className="text-xl font-semibold">{proposal.title}</h2>
              <p className="text-sm text-gray-600">Status: {proposal.status}</p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-green-700">Yes: {proposal.votes.yes}</span>
                <span className="text-red-700">No: {proposal.votes.no}</span>
              </div>
              <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded text-sm">Vote Now</button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
