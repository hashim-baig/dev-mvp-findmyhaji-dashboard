--
-- PostgreSQL database dump
--

\restrict Tv3jrVvd9puga8i35YfnM7S1JycimhupumGI7kRaE7szHSkJcvmbMuGLHbU0PJ1

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.roles OWNER TO admin;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    firstname character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    mobile character varying(20) NOT NULL,
    role integer NOT NULL,
    displayrole character varying(255),
    location character varying(500),
    avatar character varying(500),
    created_at timestamp with time zone,
    lastname character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.roles (id, name) FROM stdin;
1	admin
2	employee
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, firstname, email, mobile, role, displayrole, location, avatar, created_at, lastname, password) FROM stdin;
1	Khazi	admin@findmyhaji.com	1234567890	1	Operation Manager	Makkah Control Center	\N	\N	Naseeruddin	$2a$12$ceEeV.kEJlTPR5muk/T6oOZPlbPRxfscc3NCrtlfPetipB6wXU4.S
5	ashutosh	ashu_sinha19872@yahoo.co.in	+966-9891994181	2	\N	\N	/uploads/profile-image/profile-image-1757621978501-470279243.png	2025-09-11 20:19:38+00	sinha	$2a$12$epKeueC0S.BRNH1IknrYV.CVVG3xKsQF/l1iSlpIQtj5ApDY3qyiG
6	amit	admin@gmail.com	+966-987654321	2	\N	\N	\N	2025-09-12 18:12:59+00	kumar	$2a$12$hfF79ISWBnjm2/K4d8vEZ.M3daOVJzsIMHJDHhVzrjDMobEiNH/o2
7	kishor	admin@admin.com	+966-9890997890	2	\N	\N	/uploads/profile-image/profile-image-1757700842613-341319761.png	2025-09-12 18:14:03+00	rawat	$2a$12$biMLsIRhj8MniDMZyi96X.vExzazYmQV8wWsLHrZJLa.3RGm1cET6
\.


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict Tv3jrVvd9puga8i35YfnM7S1JycimhupumGI7kRaE7szHSkJcvmbMuGLHbU0PJ1

