import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Spinner from '../../components/Spinner';
import Layout from '../../components/Layout';
const VotingScreen = dynamic(() => import('../../components/VotingScreen'), {
	loading: () => <Spinner />
});

export default () => {
	const [ errors, setErrors ] = useState('');
	const [ isLoading, setIsLoading ] = useState(true);
	const [ data, setData ] = useState({});
	const [ successful, setSuccessful ] = useState(false);
	const router = useRouter();
	const { id } = router.query;

	useEffect(
		() => {
			setIsLoading(true);
			if (id) {
				fetch(`/api/vote/${id}`).then((res) => res.json()).then((data) => {
					setData(data);
					setIsLoading(false);
				});
			}
		},
		[ id ]
	);

	const vote = async ({ voterId, voterSecret, cIndex }) => {
		if (!voterId || !voterSecret || cIndex < 0) return setErrors('All values are required');
		setIsLoading(true);
		const data = {
			election_id: id,
			voter_id: voterId,
			voter_secret: voterSecret,
			c_index: cIndex
		};
		const res = await fetch('/api/vote', {
			method: 'PUT',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify(data)
		});
		const result = await res.json();
		if (result.success) setSuccessful(true);
		else setErrors(result.error);
		setIsLoading(false);
	};

	return (
		<Layout>
			{!isLoading ? successful ? (
				<div className='container'>
					<h1>Vote Passed</h1>
					<button onClick={() => router.push('/results/[id]', `/results/${id}`)}>See Results</button>
				</div>
			) : data.success ? (
				<VotingScreen data={data} vote={vote} errors={errors} />
			) : (
				<div className='container'>
					<h1>Given Election ID is invalid</h1>
					<button onClick={() => router.push('/vote')}>Go Back</button>
				</div>
			) : (
				<Spinner />
			)}
		</Layout>
	);
};